module.exports = function (error, _, res, _) {
    console.error(error);
    res.status(500).json({ message: error?.message || 'Server error' });
}