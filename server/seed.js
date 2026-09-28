const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const Job = require('./models/Job');
const Application = require('./models/Application');
const Session = require('./models/Session');

const seedData = async () => {
  try {
    console.log('--- Connecting to MongoDB for Seeding ---');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jobboard_v2');
    console.log('✓ Connected to MongoDB');

    // Clean existing collections
    await Promise.all([
      User.deleteMany({}),
      Job.deleteMany({}),
      Application.deleteMany({}),
      Session.deleteMany({}),
    ]);
    console.log('✓ Cleared previous database collections');

    // Hash common password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Password123!', salt);

    // 1. Create Users
    console.log('Inserting seed users...');
    const employer1 = await User.create({
      name: 'Sara Mengistu',
      email: 'employer@demo.com',
      passwordHash,
      role: 'EMPLOYER',
      company: 'Addis Tech Solutions',
    });

    const employer2 = await User.create({
      name: 'Michael Cloud',
      email: 'recruiter@demo.com',
      passwordHash,
      role: 'EMPLOYER',
      company: 'FinTech Global',
    });

    const seeker1 = await User.create({
      name: 'Dawit Abebe',
      email: 'seeker1@demo.com',
      passwordHash,
      role: 'JOB_SEEKER',
    });

    const seeker2 = await User.create({
      name: 'Hanna Tesfaye',
      email: 'seeker2@demo.com',
      passwordHash,
      role: 'JOB_SEEKER',
    });

    console.log('✓ Created 4 seed users (Password: Password123!)');

    // 2. Create Jobs
    console.log('Inserting seed job postings...');
    const jobs = await Job.create([
      {
        title: 'Senior Full Stack MERN Developer',
        description:
          'We are seeking an experienced full-stack engineer to build scalable distributed web applications using Node.js, Express, React, and MongoDB.',
        company: employer1.company,
        location: 'Addis Ababa (Hybrid)',
        type: 'Full-time',
        category: 'Technology',
        salary: 65000,
        requirements: ['React 18+', 'Node.js', 'MongoDB aggregation', 'RESTful API architecture'],
        postedBy: employer1._id,
        status: 'OPEN',
      },
      {
        title: 'Cloud DevOps & Site Reliability Engineer',
        description:
          'Design and maintain zero-downtime CI/CD pipelines, containerize backend microservices with Docker, and orchestrate with Kubernetes.',
        company: employer1.company,
        location: 'Remote',
        type: 'Full-time',
        category: 'Technology',
        salary: 80000,
        requirements: ['Docker', 'Kubernetes', 'AWS or GCP', 'Linux system administration'],
        postedBy: employer1._id,
        status: 'OPEN',
      },
      {
        title: 'Senior UI/UX Product Designer',
        description:
          'Transform complex recruitment and workflow management products into intuitive, sleek user experiences with Figma and design systems.',
        company: employer1.company,
        location: 'Remote',
        type: 'Contract',
        category: 'Design',
        salary: 55000,
        requirements: ['Figma', 'Design tokens', 'User testing', 'Wireframing'],
        postedBy: employer1._id,
        status: 'OPEN',
      },
      {
        title: 'Financial Systems Data Analyst',
        description:
          'Analyze transaction trends, build interactive dashboard metrics, and ensure regulatory compliance in banking applications.',
        company: employer2.company,
        location: 'Addis Ababa',
        type: 'Full-time',
        category: 'Finance & Banking',
        salary: 48000,
        requirements: ['SQL', 'Python', 'Financial modeling', 'PowerBI'],
        postedBy: employer2._id,
        status: 'OPEN',
      },
      {
        title: 'Clinical Operations Healthcare Lead',
        description:
          'Coordinate patient workflows, optimize clinical service schedules, and integrate healthcare records with digital platforms.',
        company: employer2.company,
        location: 'Bole, Addis Ababa',
        type: 'Full-time',
        category: 'Healthcare',
        salary: 52000,
        requirements: ['Health informatics', 'Operational management', 'Patient relations'],
        postedBy: employer2._id,
        status: 'OPEN',
      },
      {
        title: 'Growth Marketing & SEO Specialist',
        description:
          'Drive organic discovery, execute multi-channel advertising campaigns, and optimize candidate acquisition funnels.',
        company: employer2.company,
        location: 'Remote',
        type: 'Part-time',
        category: 'Marketing',
        salary: 32000,
        requirements: ['Google Analytics 4', 'SEO optimization', 'Content strategy', 'Copywriting'],
        postedBy: employer2._id,
        status: 'OPEN',
      },
      {
        title: 'B2B Enterprise Account Executive',
        description:
          'Cultivate partnerships with high-growth companies seeking streamlined recruitment management software solutions.',
        company: employer2.company,
        location: 'Addis Ababa',
        type: 'Full-time',
        category: 'Sales',
        salary: 60000,
        requirements: ['B2B Sales', 'CRM management', 'Negotiation', 'Lead qualification'],
        postedBy: employer2._id,
        status: 'OPEN',
      },
      {
        title: 'Legacy Python Microservices Developer (Archived)',
        description:
          'Maintenance of legacy ETL microservices. This posting has completed recruitment and is closed to new applicants.',
        company: employer1.company,
        location: 'Remote',
        type: 'Contract',
        category: 'Technology',
        salary: 40000,
        requirements: ['Python 3.8', 'PostgreSQL'],
        postedBy: employer1._id,
        status: 'CLOSED', // Demonstrates closed job handling
      },
    ]);

    console.log(`✓ Created ${jobs.length} seed job listings across various categories`);

    // 3. Create Sample Applications
    console.log('Inserting seed job applications...');
    await Application.create([
      {
        job: jobs[0]._id, // Senior MERN Developer
        applicant: seeker1._id,
        coverLetter:
          'I have 4+ years of hands-on experience building full-stack JavaScript applications with React and Express. I would love to contribute to Addis Tech Solutions!',
        resumeLink: 'https://drive.google.com/file/d/sample-resume-dawit/view?usp=sharing',
        status: 'PENDING',
      },
      {
        job: jobs[1]._id, // DevOps Engineer
        applicant: seeker1._id,
        coverLetter:
          'Extensive experience containerizing Node.js applications and orchestrating staging clusters. Looking forward to discussing this opportunity.',
        resumeLink: 'https://drive.google.com/file/d/sample-resume-dawit/view?usp=sharing',
        status: 'REVIEWED',
      },
      {
        job: jobs[0]._id, // Senior MERN Developer
        applicant: seeker2._id,
        coverLetter:
          'Passionate frontend developer specializing in responsive React UI components and state management with clean RESTful API integration.',
        resumeLink: 'https://dropbox.com/s/sample-resume-hanna/cv.pdf',
        status: 'ACCEPTED',
      },
    ]);

    console.log('✓ Created 3 sample candidate applications');
    console.log('\n=========================================');
    console.log('Database Seeding Completed Successfully!');
    console.log('=========================================');
    console.log('Credentials:');
    console.log('  Employer 1:  employer@demo.com   / Password123!');
    console.log('  Employer 2:  recruiter@demo.com  / Password123!');
    console.log('  Seeker 1:    seeker1@demo.com    / Password123!');
    console.log('  Seeker 2:    seeker2@demo.com    / Password123!');
    console.log('=========================================');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

seedData();
