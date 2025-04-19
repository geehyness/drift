import { writeClient } from './sanityClient';
import { generateSalt, hashPassword } from '../../dash-drift/src/lib/passwordUtils';

async function createAdminUser() {
  const username = 'dashboard'; // Change this
  const password = 'ViewTheMeals!'; // Change this
  
  const salt = generateSalt();
  const passwordHash = hashPassword(password, salt);

  try {
    const result = await writeClient.create({
      _type: 'adminUser',
      username,
      passwordHash,
      salt
    });

    console.log('Admin user created successfully!');
    console.log('ID:', result._id);
  } catch (error) {
    console.error('Error creating admin user:');
    console.error(error);
  }
}

createAdminUser();