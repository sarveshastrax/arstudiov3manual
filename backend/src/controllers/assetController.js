const prisma = require('../config/db');
const { generateUploadUrl, deleteFile } = require('../services/s3Service');

// @desc    Get signed URL for S3 upload
// @route   POST /api/assets/upload-url
// @access  Private
const getUploadUrl = async (req, res) => {
    const { extension, contentType, type, name } = req.body;

    if (!extension || !contentType || !type || !name) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const { uploadUrl, key } = await generateUploadUrl(extension, contentType);

        // Create asset record in DB (pending status until confirmed upload? 
        // Or just create it now and client updates it? 
        // For simplicity, we'll create the record now. 
        // In a real app, you might want a webhook or a separate confirm step.)

        // Construct public URL (assuming standard S3 URL structure)
        // For CloudFront, this would be different.
        const publicUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

        const asset = await prisma.asset.create({
            data: {
                name,
                type, // AssetType enum: IMAGE, VIDEO, MODEL_3D, AUDIO
                url: publicUrl,
                mimeType: contentType,
                userId: req.user.id,
            }
        });

        res.json({ uploadUrl, key, asset });
    } catch (error) {
        console.error('S3 Upload Error:', error);
        res.status(500).json({ message: 'Failed to generate upload URL' });
    }
};

// @desc    Delete asset
// @route   DELETE /api/assets/:id
// @access  Private
const deleteAsset = async (req, res) => {
    const { id } = req.params;

    try {
        const asset = await prisma.asset.findUnique({
            where: { id }
        });

        if (!asset) {
            return res.status(404).json({ message: 'Asset not found' });
        }

        // Check ownership
        if (asset.userId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized to delete this asset' });
        }

        // Extract key from URL
        // URL: https://bucket.s3.region.amazonaws.com/assets/key
        const key = asset.url.split('.com/')[1];

        if (key) {
            await deleteFile(key);
        }

        await prisma.asset.delete({
            where: { id }
        });

        res.json({ message: 'Asset deleted' });
    } catch (error) {
        console.error('Delete Asset Error:', error);
        res.status(500).json({ message: 'Failed to delete asset' });
    }
};

// @desc    Get user assets
// @route   GET /api/assets
// @access  Private
const getUserAssets = async (req, res) => {
    try {
        const assets = await prisma.asset.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' }
        });
        res.json(assets);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getUploadUrl,
    deleteAsset,
    getUserAssets
};
