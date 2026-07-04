require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
const User = require('./models/userModel');

const makeAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    // Find Sarah Mitchell and make her admin
    const user = await User.findOneAndUpdate(
      { fullName: 'Sarah Mitchell' },
      { role: 'admin' },
      { new: true }
    );

    if (user) {
      console.log(`Successfully updated ${user.fullName} to admin!`);
    } else {
      console.log('Sarah Mitchell not found in the database. Please check the spelling.');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
};

makeAdmin();
