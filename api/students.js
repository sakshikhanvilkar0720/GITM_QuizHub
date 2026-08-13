const clientPromise = require('./db');

module.exports = async (req, res) => {
    try {
        const client = await clientPromise;
        const db = client.db('QuizHub');
        const students = db.collection('students');

        // GET → Fetch all students
        if (req.method === 'GET') {
            const allStudents = await students
                .find({})
                .sort({ createdAt: -1 })
                .toArray();

            return res.status(200).json(allStudents);
        }

        // POST → Save a student
        if (req.method === 'POST') {
            const { name, roll } = req.body || {};

            if (!name || !roll) {
                return res.status(400).json({
                    error: 'Name and roll number are required'
                });
            }

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
        }

        return res.status(405).json({
            error: 'Method not allowed'
        });

    } catch (error) {
        console.error('Student API error:', error);

        return res.status(500).json({
            error: 'Failed to process students'
        });
    }
};