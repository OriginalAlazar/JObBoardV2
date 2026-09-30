/**
 * @file seed.js
 * @description Database seeding script for local development and demonstration testing.
 * Populates MongoDB with predefined user accounts (Employers and Job Seekers),
 * diverse job postings across Ethiopian companies, and sample candidate applications
 * across different review statuses (PENDING, REVIEWED, ACCEPTED).
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const path = require('path');

// Load environment variables from the server/.env file
dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const Job = require('./models/Job');
const Application = require('./models/Application');
const Session = require('./models/Session');

/**
 * seedData
 * Asynchronous orchestrator that wipes existing database collections and populates fresh sample records.
 */
const seedData = async () => {
  try {
    console.log('--- Connecting to MongoDB for Seeding (Sira Brand Guide) ---');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jobboard_v2');
    console.log('✓ Connected to MongoDB');

    // 1. Clean existing collections to ensure a fresh, consistent database state
    await Promise.all([
      User.deleteMany({}),
      Job.deleteMany({}),
      Application.deleteMany({}),
      Session.deleteMany({}),
    ]);
    console.log('✓ Cleared previous database collections');

    // 2. Pre-hash a common development password ('Password123!') for all seed users
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Password123!', salt);

    // 3. Create Seed Users matching Sira brand guidelines (2 Employers, 2 Job Seekers)
    console.log('Inserting seed users...');
    const employer1 = await User.create({
      name: 'Hana Alemu',
      email: 'employer@demo.com',
      passwordHash,
      role: 'EMPLOYER',
      company: 'NEBO Tech',
    });

    const employer2 = await User.create({
      name: 'Abebe Bikila',
      email: 'recruiter@demo.com',
      passwordHash,
      role: 'EMPLOYER',
      company: 'Luna Digital',
    });

    const seeker1 = await User.create({
      name: 'Samuel Tadesse',
      email: 'seeker1@demo.com',
      passwordHash,
      role: 'JOB_SEEKER',
    });

    const seeker2 = await User.create({
      name: 'Sarah Mekonnen',
      email: 'seeker2@demo.com',
      passwordHash,
      role: 'JOB_SEEKER',
    });

    console.log('✓ Created 4 seed users (Password: Password123!)');

    // 4. Create Job Postings across Ethiopian organizations and technology sectors
    console.log('Inserting seed job postings matching Sira guide...');
    const jobs = await Job.create([
      {
        title: 'Software Engineer',
        description:
          'We are seeking an experienced software engineer to build scalable web applications and distributed backend microservices. You will work closely with product teams to design clean RESTful interfaces and robust database schemas.',
        company: 'NEBO Tech',
        location: 'Addis Ababa',
        type: 'Full-time',
        category: 'Technology',
        salary: 35000,
        requirements: ['React and Node.js', 'RESTful API architecture', 'MongoDB / NoSQL databases', 'Git workflows'],
        postedBy: employer1._id,
        status: 'OPEN',
      },
      {
        title: 'Frontend Developer',
        description:
          'Join our product engineering group to create responsive, accessible, and fast web user interfaces. You will translate design systems into clean, modern component architectures.',
        company: 'Luna Digital',
        location: 'Addis Ababa',
        type: 'Full-time',
        category: 'Technology',
        salary: 28000,
        requirements: ['JavaScript (ES6+)', 'React 18+', 'Modern CSS & responsive layouts', 'State management'],
        postedBy: employer2._id,
        status: 'OPEN',
      },
      {
        title: 'IT Support Specialist',
        description:
          'Provide technical infrastructure support, resolve network connectivity issues, and manage office workstation hardware and security policies.',
        company: 'Ethio Systems',
        location: 'Addis Ababa',
        type: 'Full-time',
        category: 'Technology',
        salary: 18000,
        requirements: ['Network troubleshooting', 'Windows & Linux server support', 'Hardware diagnostics'],
        postedBy: employer1._id,
        status: 'OPEN',
      },
      {
        title: 'Accountant',
        description:
          'Manage daily bookkeeping, reconcile bank statements, prepare monthly tax filings, and maintain statutory financial compliance reports.',
        company: 'Abay Business Group',
        location: 'Addis Ababa',
        type: 'Full-time',
        category: 'Business & Finance',
        salary: 22000,
        requirements: ['Degree in Accounting or Finance', 'Peachtree / QuickBooks', 'Ethiopian tax regulations'],
        postedBy: employer2._id,
        status: 'OPEN',
      },
      {
        title: 'Operations Coordinator',
        description:
          'Coordinate operational supply chains, liaise with vendor partners, and streamline company procurement schedules across regional offices.',
        company: 'Nile Commerce',
        location: 'Addis Ababa',
        type: 'Full-time',
        category: 'Business & Finance',
        salary: 24000,
        requirements: ['Supply chain management', 'Vendor coordination', 'Inventory tracking', 'Analytical reporting'],
        postedBy: employer1._id,
        status: 'OPEN',
      },
      {
        title: 'Product Designer',
        description:
          'Lead end-to-end product design across web and mobile experiences. Conduct user research, define UX wireframes, and maintain modular design systems.',
        company: 'Luna Digital',
        location: 'Addis Ababa',
        type: 'Full-time',
        category: 'Design & Creative',
        salary: 30000,
        requirements: ['Figma design systems', 'User journey mapping', 'Prototyping & usability testing'],
        postedBy: employer2._id,
        status: 'OPEN',
      },
      {
        title: 'Graphic Designer',
        description:
          'Create high-impact brand identities, digital marketing creative assets, and print materials for high-growth local businesses and international partners.',
        company: 'Creative Hub Ethiopia',
        location: 'Addis Ababa',
        type: 'Full-time',
        category: 'Design & Creative',
        salary: 18000,
        requirements: ['Adobe Illustrator & Photoshop', 'Visual storytelling', 'Brand identity guidelines'],
        postedBy: employer1._id,
        status: 'OPEN',
      },
      {
        title: 'Digital Marketing Specialist',
        description:
          'Develop organic and paid digital campaign strategies, manage social media growth channels, and optimize customer acquisition funnels.',
        company: 'Habesha Commerce',
        location: 'Addis Ababa',
        type: 'Full-time',
        category: 'Sales & Customer Service',
        salary: 24000,
        requirements: ['Performance marketing', 'Content planning', 'Social media analytics', 'Campaign ROI tracking'],
        postedBy: employer2._id,
        status: 'OPEN',
      },
      {
        title: 'Legacy Python Microservices Developer (Archived)',
        description:
          'Maintenance of legacy ETL microservices. This posting has completed recruitment and is closed to new applicants.',
        company: 'NEBO Tech',
        location: 'Addis Ababa',
        type: 'Full-time',
        category: 'Technology',
        salary: 20000,
        requirements: ['Python 3.8', 'PostgreSQL'],
        postedBy: employer1._id,
        status: 'CLOSED', // Demonstrates closed job handling and UI states
      },
    ]);

    console.log(`✓ Created ${jobs.length} seed job listings across Ethiopian organizations`);

    // 5. Create Sample Applications across multiple review states
    console.log('Inserting seed job applications...');
    await Application.create([
      {
        job: jobs[0]._id, // Software Engineer at NEBO Tech
        applicant: seeker1._id, // Samuel Tadesse
        coverLetter:
          'I have 3+ years of experience building modern web applications with React and Node.js. I am very excited about NEBO Tech and would love to contribute to your engineering team.',
        resumeLink: 'https://drive.google.com/file/d/sample-resume-samuel/view?usp=sharing',
        status: 'PENDING',
      },
      {
        job: jobs[1]._id, // Frontend Developer at Luna Digital
        applicant: seeker1._id, // Samuel Tadesse
        coverLetter:
          'Passionate frontend developer specializing in responsive React UI components and state management with clean RESTful API integration.',
        resumeLink: 'https://drive.google.com/file/d/sample-resume-samuel/view?usp=sharing',
        status: 'REVIEWED',
      },
      {
        job: jobs[5]._id, // Product Designer at Luna Digital
        applicant: seeker2._id, // Sarah Mekonnen
        coverLetter:
          'Extensive experience creating modular Figma design systems and user journey maps. Looking forward to discussing this opportunity with Luna Digital.',
        resumeLink: 'https://dropbox.com/s/sample-resume-sarah/cv.pdf',
        status: 'ACCEPTED',
      },
    ]);

    console.log('✓ Created 3 sample candidate applications');
    console.log('\n=========================================');
    console.log('Sira Database Seeding Completed Successfully!');
    console.log('=========================================');
    console.log('Credentials:');
    console.log('  Employer 1 (Hana Alemu):    employer@demo.com   / Password123!');
    console.log('  Employer 2 (Abebe Bikila):  recruiter@demo.com  / Password123!');
    console.log('  Seeker 1 (Samuel Tadesse):  seeker1@demo.com    / Password123!');
    console.log('  Seeker 2 (Sarah Mekonnen):  seeker2@demo.com    / Password123!');
    console.log('=========================================');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    // 6. Always cleanly disconnect MongoDB client connection upon completion
    await mongoose.disconnect();
  }
};

seedData();

