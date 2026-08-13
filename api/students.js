const clientPromise = require('./db');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({
            error: 'Method not allowed'
        });
    }

    try {
        const { name, roll } = req.body || {};

        if (!name || !roll) {
            return res.status(400).json({
                error: 'Name and roll number are required'
            });
        }

        const client = await clientPromise;
        const db = client.db('QuizHub');
        const students = db.collection('students');

        const cleanName = String(name).trim();
        const cleanRoll = String(roll).trim();

        const existing = await students.findOne({
            roll: cleanRoll
        });

        if (existing) {
            return res.status(200).json({
                message: 'Student already exists',
                student: existing
            });
        }

        const newStudent = {
            name: cleanName,
            roll: cleanRoll,
            createdAt: new Date()
        };

        const result = await students.insertOne(newStudent);

        return res.status(201).json({
            message: 'Student saved successfully',
            student: {
                _id: result.insertedId,
                ...newStudent
            }
        });

    } catch (error) {
        console.error('Student API error:', error);

        return res.status(500).json({
            error: 'Failed to save student'
        });
    }
};