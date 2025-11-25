const prisma = require('../config/db');

// @desc    Create new experience
// @route   POST /api/experiences
// @access  Private
const createExperience = async (req, res) => {
    const { title, description } = req.body;

    if (!title) {
        return res.status(400).json({ message: 'Title is required' });
    }

    try {
        const experience = await prisma.experience.create({
            data: {
                title,
                description,
                userId: req.user.id,
                config: { objects: [] } // Initial empty config
            }
        });

        res.status(201).json(experience);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Save experience config
// @route   PUT /api/experiences/:id
// @access  Private
const saveExperience = async (req, res) => {
    const { id } = req.params;
    const { config, title, description } = req.body;

    try {
        const experience = await prisma.experience.findUnique({
            where: { id }
        });

        if (!experience) {
            return res.status(404).json({ message: 'Experience not found' });
        }

        if (experience.userId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const updatedExperience = await prisma.experience.update({
            where: { id },
            data: {
                config: config || experience.config,
                title: title || experience.title,
                description: description || experience.description
            }
        });

        res.json(updatedExperience);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Publish/Unpublish experience
// @route   POST /api/experiences/:id/publish
// @access  Private
const publishExperience = async (req, res) => {
    const { id } = req.params;
    const { isPublished } = req.body; // true or false

    try {
        const experience = await prisma.experience.findUnique({
            where: { id }
        });

        if (!experience) {
            return res.status(404).json({ message: 'Experience not found' });
        }

        if (experience.userId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const updatedExperience = await prisma.experience.update({
            where: { id },
            data: { isPublished }
        });

        res.json(updatedExperience);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get experience (Protected - for Editor)
// @route   GET /api/experiences/:id
// @access  Private
const getExperience = async (req, res) => {
    const { id } = req.params;

    try {
        const experience = await prisma.experience.findUnique({
            where: { id }
        });

        if (!experience) {
            return res.status(404).json({ message: 'Experience not found' });
        }

        if (experience.userId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json(experience);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get public experience (Public - for Viewer)
// @route   GET /api/experiences/public/:id
// @access  Public
const getPublicExperience = async (req, res) => {
    const { id } = req.params;

    try {
        const experience = await prisma.experience.findUnique({
            where: { id }
        });

        if (!experience) {
            return res.status(404).json({ message: 'Experience not found' });
        }

        if (!experience.isPublished) {
            return res.status(404).json({ message: 'Experience is not published' });
        }

        // Return only necessary data for viewer
        res.json({
            id: experience.id,
            title: experience.title,
            config: experience.config,
            createdAt: experience.createdAt
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get user experiences
// @route   GET /api/experiences
// @access  Private
const getUserExperiences = async (req, res) => {
    try {
        const experiences = await prisma.experience.findMany({
            where: { userId: req.user.id },
            orderBy: { updatedAt: 'desc' }
        });
        res.json(experiences);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    createExperience,
    saveExperience,
    publishExperience,
    getExperience,
    getPublicExperience,
    getUserExperiences
};
