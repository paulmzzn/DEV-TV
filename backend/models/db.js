const mongoose = require('mongoose');

const connect = async () => {
  try {
    await mongoose.connect('mongodb+srv://admin:77mHo6D5tc6upib7@cluster0.qs763.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = { connect };