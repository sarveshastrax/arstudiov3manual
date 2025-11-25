import React, { useEffect, useState, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF } from '@react-three/drei';
import { experienceService } from '../services/api';

const Model = ({ url, ...props }) => {
    const { scene } = useGLTF(url);
    return <primitive object={scene} {...props} />;
};

const ViewerSceneObject = ({ obj }) => {
    return (
        <mesh
            position={obj.position}
            rotation={obj.rotation}
            scale={obj.scale}
        >
            {obj.type === 'model' && obj.url ? (
                <Suspense fallback={null}>
                    <Model url={obj.url} />
                </Suspense>
            ) : (
                <boxGeometry />
            )}
            <meshStandardMaterial color="white" />
        </mesh>
    );
};

const Viewer = () => {
    const { id } = useParams();
    const [experience, setExperience] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchExperience = async () => {
            try {
                const res = await experienceService.getPublic(id);
                setExperience(res.data);
            } catch (err) {
                console.error(err);
                setError('Failed to load experience. It might not be published.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchExperience();
        }
    }, [id]);

    if (loading) return <div className="flex items-center justify-center h-screen bg-black text-white">Loading AR Experience...</div>;
    if (error) return <div className="flex items-center justify-center h-screen bg-black text-red-500">{error}</div>;
    if (!experience) return null;

    const objects = experience.config?.objects || [];

    return (
        <div className="w-full h-screen bg-black">
            <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <Environment preset="city" />
                <OrbitControls autoRotate />

                {objects.map((obj) => (
                    <ViewerSceneObject key={obj.id} obj={obj} />
                ))}
            </Canvas>

            <div className="absolute bottom-4 left-4 text-white bg-black/50 p-2 rounded">
                <h1 className="text-lg font-bold">{experience.title}</h1>
                <p className="text-xs">Powered by Adhvyk AR Studio</p>
            </div>
        </div>
    );
};

export default Viewer;
