const clientPromise = require('./db');

module.exports = async (req, res) => {

    try {
        const client = await clientPromise;
        const db = client.db('QuizHub');
        const results = db.collection('results');

        // =========================
        // GET → Fetch all results
        // =========================
        if (req.method === 'GET') {

            const allResults = await results
                .find({})
                .sort({ date: -1 })
                .toArray();

            return res.status(200).json(allResults);
        }

        // =========================
        // POST → Save new result
        // =========================
        if (req.method === 'POST') {

            const {
                student,
                roll,
                quiz,
                quizId,
                subject,
                score,
                total,
                pct,
                passed
            } = req.body || {};

            if (!student || !roll || !quiz || !quizId) {
                return res.status(400).json({
                    error: 'Required result data is missing'
                });
            }

            const newResult = {
                student: String(student).trim(),
                roll: String(roll).trim(),
                quiz: String(quiz).trim(),
                quizId: String(quizId),
                subject: String(subject || '').trim(),
                score: Number(score),
                total: Number(total),
                pct: Number(pct),
                passed: Boolean(passed),
                date: new Date()
            };

            const result = await results.insertOne(newResult);

            return res.status(201).json({
                message: 'Result saved successfully',
                result: {
                    _id: result.insertedId,
                    ...newResult
                }
            });
        }

        // =========================
        // Other methods
        // =========================
        return res.status(405).json({
            error: 'Method not allowed'
        });

    } catch (error) {

        console.error('Result API error:', error);

        return res.status(500).json({
            error: 'Failed to process results'
        });
    }
};