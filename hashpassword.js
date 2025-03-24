import bcrypt from 'bcrypt';

const saltRounds = 10; // You can adjust the cost factor
const newPassword = 'Admin@123'; // The new password you want to set

bcrypt.hash(newPassword, saltRounds, function(err, hash) {
    if (err) {
        console.error('Error hashing password:', err);
    } else {
        console.log('Hashed Password:', hash); // Use this hashed password in your code
    }
    
});