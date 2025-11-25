import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, TransformControls, Grid, Environment, useGLTF } from '@react-three/drei';
import useEditorStore from '../../store/editorStore';

const Model = ({ url, ...props }) => {
    const { scene } = useGLTF(url);
    return <primitive object={scene} {...props} />;
};

const SceneObject = ({ obj, isSelected, onSelect, onTransform }) => {
    return (
        <>
            {isSelected && (
                <TransformControls
                    object={undefined} // Attached to the object below via ref or automatic
                    mode={useEditorStore.getState().transformMode}
                    onObjectChange={(e) => {
                        if (e?.target?.object) {
                            const { position, rotation, scale } = e.target.object;
                            onTransform(obj.id, {
                                position: [position.x, position.y, position.z],
                                rotation: [rotation.x, rotation.y, rotation.z],
                                scale: [scale.x, scale.y, scale.z],
                            });
                        }
                    }}
                >
                    <mesh
                        position={obj.position}
                        rotation={obj.rotation}
                        scale={obj.scale}
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelect(obj.id);
                        }}
                    >
                        {/* Placeholder box if no URL, or load model */}
                        {obj.type === 'model' && obj.url ? (
                            <Suspense fallback={<meshStandardMaterial color="gray" />}>
                                <Model url={obj.url} />
                            </Suspense>
                        ) : (
                            <boxGeometry />
                        )}
                        <meshStandardMaterial color={isSelected ? 'orange' : 'white'} />
                    </mesh>
                </TransformControls>
            )}

            {!isSelected && (
                <mesh
                    position={obj.position}
                    rotation={obj.rotation}
                    scale={obj.scale}
                    onClick={(e) => {
                        e.stopPropagation();
                        onSelect(obj.id);
                    }}
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
            )}
        </>
    );
};

const EditorCanvas = () => {
    const { objects, selectedId, selectObject, updateObject } = useEditorStore();

    return (
        <div className="w-full h-full bg-gray-900">
            <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <Environment preset="city" />
                <Grid infiniteGrid fadeDistance={50} sectionColor="white" cellColor="gray" />

                <OrbitControls makeDefault />

                {objects.map((obj) => (
                    <SceneObject
                        key={obj.id}
                        obj={obj}
                        isSelected={selectedId === obj.id}
                        onSelect={selectObject}
                        onTransform={updateObject}
                    />
                ))}
            </Canvas>
        </div>
    );
};

export default EditorCanvas;
