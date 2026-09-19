// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config();
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require('@prisma/client');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Pool } = require('pg');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaPg } = require('@prisma/adapter-pg');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const bcrypt = require('bcryptjs');

const regionDefinitions = [
    { name: 'Greater Accra Region', description: 'National capital region, most populated and dynamic.' },
    { name: 'Ashanti Region', description: 'Central heartland region with a strong campus church network.' },
    { name: 'Central Region', description: 'Historic coastal region with thriving student ministries.' },
    { name: 'Western Region', description: 'Resource-rich western region with active fellowship chapters.' },
    { name: 'Northern Region', description: 'Large northern region with strong regional collaboration.' },
    { name: 'Volta Region', description: 'Eastern corridor region with a growing student ministry footprint.' },
    { name: 'Eastern Region', description: 'Fast-growing chapter network with vibrant campus outreaches.' },
    { name: 'Bono East Region', description: 'Newer region with emerging leadership and student activation.' }
];

const chapterDefinitions = [
    { name: 'UG Legon Chapter', university: 'University of Ghana', campus: 'Legon', regionName: 'Greater Accra Region' },
    { name: 'UPSA Chapter', university: 'University of Professional Studies', campus: 'Madina', regionName: 'Greater Accra Region' },
    { name: 'GIMPA Chapter', university: 'Ghana Institute of Management and Public Administration', campus: 'Greenhill', regionName: 'Greater Accra Region' },
    { name: 'KNUST Chapter', university: 'Kwame Nkrumah University of Science & Technology', campus: 'Kumasi', regionName: 'Ashanti Region' },
    { name: 'Kumasi Technical Chapter', university: 'Kumasi Technical University', campus: 'Kumasi', regionName: 'Ashanti Region' },
    { name: 'UCC Chapter', university: 'University of Cape Coast', campus: 'Cape Coast', regionName: 'Central Region' },
    { name: 'UCC Day Campus Chapter', university: 'University of Cape Coast', campus: 'Day Campus', regionName: 'Central Region' },
    { name: 'UMaT Chapter', university: 'University of Mines & Technology', campus: 'Tarkwa', regionName: 'Western Region' },
    { name: 'Takoradi Technical Chapter', university: 'Takoradi Technical University', campus: 'Takoradi', regionName: 'Western Region' },
    { name: 'UDS Chapter', university: 'University for Development Studies', campus: 'Tamale', regionName: 'Northern Region' },
    { name: 'UDS Nyankpala Chapter', university: 'University for Development Studies', campus: 'Nyankpala', regionName: 'Northern Region' },
    { name: 'Koforidua Technical Chapter', university: 'Koforidua Technical University', campus: 'Koforidua', regionName: 'Eastern Region' },
    { name: 'Ho Polytechnic Chapter', university: 'Ho Technical University', campus: 'Ho', regionName: 'Volta Region' },
    { name: 'Techiman University Chapter', university: 'Techiman University', campus: 'Techiman', regionName: 'Bono East Region' }
];

const departments = [
    'Computer Science', 'Business Administration', 'Nursing', 'Mechanical Engineering',
    'Law', 'Economics', 'Psychology', 'Statistics', 'Architecture', 'Biochemistry',
    'Accounting', 'Banking & Finance', 'Information Technology', 'Marketing', 'Public Health'
];

const eventDefinitions = [
    {
        title: 'CASA National Leadership Summit',
        description: 'A two-day strategy summit for chapter executives across the network.',
        date: new Date('2026-08-05T10:00:00Z'),
        endDate: new Date('2026-08-06T16:00:00Z'),
        venue: 'Accra Conference Centre',
        category: 'Leadership',
        scope: 'NATIONAL'
    },
    {
        title: 'National Youth Talent Night',
        description: 'A showcase of student talent and ministry fellowship for all regions.',
        date: new Date('2026-10-10T18:00:00Z'),
        endDate: new Date('2026-10-10T21:00:00Z'),
        venue: 'Kwame Nkrumah Memorial Park',
        category: 'Fellowship',
        scope: 'NATIONAL'
    },
    {
        title: 'Greater Accra Regional Outreach',
        description: 'Community engagement and campus evangelism across Accra chapters.',
        date: new Date('2026-07-20T09:00:00Z'),
        endDate: new Date('2026-07-20T15:00:00Z'),
        venue: 'Independence Square, Accra',
        category: 'Outreach',
        scope: 'REGIONAL',
        regionName: 'Greater Accra Region'
    },
    {
        title: 'Ashanti Region Campus Prayer Walk',
        description: 'Prayer march across regional campuses to launch the new academic session.',
        date: new Date('2026-08-12T08:00:00Z'),
        endDate: new Date('2026-08-12T12:00:00Z'),
        venue: 'Kumasi Civic Centre',
        category: 'Prayer',
        scope: 'REGIONAL',
        regionName: 'Ashanti Region'
    },
    {
        title: 'Western Region Christian Arts Night',
        description: 'An evening of worship and performing arts with chapter leaders and guests.',
        date: new Date('2026-09-28T19:00:00Z'),
        endDate: new Date('2026-09-28T22:00:00Z'),
        venue: 'Takoradi Cultural Centre',
        category: 'Fellowship',
        scope: 'REGIONAL',
        regionName: 'Western Region'
    },
    {
        title: 'KNUST Prayer Retreat',
        description: 'A weekend retreat for KNUST chapter members and chapter leaders.',
        date: new Date('2026-06-25T14:00:00Z'),
        endDate: new Date('2026-06-27T12:00:00Z'),
        venue: 'KNUST CCB Ground',
        category: 'Prayer',
        scope: 'LOCAL',
        chapterName: 'KNUST Chapter'
    },
    {
        title: 'UCC Freshers Welcome',
        description: 'Welcome dinner and fellowship for new undergraduate members.',
        date: new Date('2026-09-03T17:00:00Z'),
        endDate: new Date('2026-09-03T20:00:00Z'),
        venue: 'UCC Great Hall',
        category: 'Orientation',
        scope: 'LOCAL',
        chapterName: 'UCC Chapter'
    },
    {
        title: 'GIMPA Chaplaincy Launch',
        description: 'Launch of a new campus ministry fellowship at GIMPA.',
        date: new Date('2026-07-22T15:00:00Z'),
        endDate: new Date('2026-07-22T18:00:00Z'),
        venue: 'GIMPA Lecture Hall A',
        category: 'Orientation',
        scope: 'LOCAL',
        chapterName: 'GIMPA Chapter'
    },
    {
        title: 'UDS Tamale Campus Outreach',
        description: 'Street outreach and registration drive for new members.',
        date: new Date('2026-07-30T10:00:00Z'),
        endDate: new Date('2026-07-30T14:00:00Z'),
        venue: 'UDS Tamale Main Campus',
        category: 'Outreach',
        scope: 'LOCAL',
        chapterName: 'UDS Chapter'
    }
];

const studentNames = [
    'Kofi Mensah', 'Ama Serwaa', 'Kwame Baffour', 'Yaa Boatemaa', 'Ekow Mensah',
    'Abena Konadu', 'Yaw Osei', 'Adjoa Appiah', 'Kojo Antwi', 'Afia Boakye',
    'Kweku Baah', 'Esi Mensah', 'Bernard Akoto', 'Selasi Dogbatse', 'Gifty Koomson',
    'Emanuel Osei', 'Priscilla Addo', 'Derick Owusu', 'Akosua Agyapong', 'Kofi Annan',
    'Maame Yaa', 'Richmond Boadi', 'Dorcas Appiah', 'Prince Boateng', 'Eunice Adjei',
    'Daniel Mensah', 'Rita Ofori', 'Stephen Addo', 'Naomi Serwaa', 'Albert Kwakye',
    'Esi Baah', 'Nana Yaa', 'Michael Appiah', 'Sally Mensah', 'Josephine Tetteh',
    'Aaron Owusu', 'Gloria Sey', 'Martin Amoah', 'Rebecca Osei', 'Peter Kwaku'
];

const sermonTopics = [
    'Walking in Purpose', 'The Power of Unity', 'Faith Beyond the Classroom',
    'Building Character for Leadership', 'Stewardship and Generosity',
    'Prayer: The Key to Breakthrough', 'Navigating Peer Pressure', 'Identity in Christ'
];

const attendanceSpeakers = [
    'Rev. Dr. Mensa Otabil', 'Pastor John Owusu', 'Pastor Sylvia Addo',
    'Rev. Emmanuel Asante', 'Pastor Esther Nyarko'
];

function pickRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function normalizeName(name) {
    return name.toLowerCase().replace(/\s+/g, '.');
}

async function createPrismaClient() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        throw new Error('DATABASE_URL is required in environment.');
    }

    const isLocal = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');
    const pool = new Pool({
        connectionString,
        ssl: isLocal ? false : { rejectUnauthorized: false }
    });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
}

async function seedFullData() {
    const prisma = await createPrismaClient();
    try {
        console.log('Seeding full demo dataset...');

        // Clear dependent production data so seed runs cleanly for demo
        await prisma.eventRSVP.deleteMany();
        await prisma.event.deleteMany();
        await prisma.attendanceRecord.deleteMany();
        await prisma.attendanceSession.deleteMany();
        await prisma.transaction.deleteMany();
        await prisma.student.deleteMany();
        await prisma.semester.deleteMany();
        await prisma.academicYear.deleteMany();
        await prisma.chapter.deleteMany();
        await prisma.auditLog.deleteMany();

        // Create regions
        const regions = [];
        for (const regionDef of regionDefinitions) {
            const region = await prisma.region.upsert({
                where: { name: regionDef.name },
                update: { description: regionDef.description },
                create: { name: regionDef.name, description: regionDef.description }
            });
            regions.push(region);
        }

        // Create chapters
        const chapters = [];
        for (const chapterDef of chapterDefinitions) {
            const region = regions.find(r => r.name === chapterDef.regionName);
            const chapter = await prisma.chapter.create({
                data: {
                    name: chapterDef.name,
                    university: chapterDef.university,
                    campus: chapterDef.campus,
                    regionId: region.id
                }
            });
            chapters.push(chapter);
        }

        const password = await bcrypt.hash('admin123', 10);
        const users = [
            { email: 'national@u-chms.gov', role: 'NATIONAL_ADMIN', name: 'National Admin', regionId: null, chapterId: null },
            { email: 'regional@u-chms.gov', role: 'REGIONAL_ADMIN', name: 'Regional Admin', regionId: regions[0].id, chapterId: null },
            { email: 'local@u-chms.gov', role: 'LOCAL_ADMIN', name: 'Local Admin', regionId: null, chapterId: chapters[0].id }
        ];

        for (const userDef of users) {
            await prisma.user.upsert({
                where: { email: userDef.email },
                update: {
                    password,
                    name: userDef.name,
                    role: userDef.role,
                    regionId: userDef.regionId,
                    chapterId: userDef.chapterId
                },
                create: {
                    email: userDef.email,
                    password,
                    name: userDef.name,
                    role: userDef.role,
                    regionId: userDef.regionId,
                    chapterId: userDef.chapterId
                }
            });
        }

        const allStudents = [];
        for (let i = 0; i < 160; i += 1) {
            const chapter = chapters[i % chapters.length];
            const baseName = studentNames[i % studentNames.length];
            const name = `${baseName}${i >= studentNames.length ? ` ${Math.floor(i / studentNames.length)}` : ''}`;
            const student = await prisma.student.create({
                data: {
                    studentId: `UC-${1000 + i}`,
                    name,
                    email: `${normalizeName(name)}@student.edu.gh`,
                    phone: `+23354${(1000000 + i).toString().slice(-9)}`,
                    department: pickRandom(departments),
                    levelYear: `${100 * ((i % 4) + 1)}`,
                    status: 'ACTIVE',
                    isLeader: i % 10 === 0,
                    position: i % 10 === 0 ? pickRandom(['Prayer Coordinator', 'Media Lead', 'Welfare Secretary', 'Event Manager', 'Campus Outreach Lead']) : null,
                    memberQrCode: `QR-${100000 + i}`,
                    chapterId: chapter.id,
                    enrollmentDate: new Date(2025, 7 + (i % 4), ((i % 25) + 3))
                }
            });
            allStudents.push(student);
        }

        const chapterStudentMap = chapters.reduce((map, chapter) => {
            map[chapter.id] = allStudents.filter(s => s.chapterId === chapter.id);
            return map;
        }, {});

        for (const chapter of chapters) {
            const academicYear = await prisma.academicYear.create({
                data: {
                    name: '2025/2026 Academic Year',
                    startDate: new Date('2025-08-01'),
                    endDate: new Date('2026-06-30'),
                    isCurrent: true,
                    chapterId: chapter.id
                }
            });
            await prisma.semester.createMany({
                data: [
                    {
                        academicYearId: academicYear.id,
                        chapterId: chapter.id,
                        name: 'Semester 1',
                        startDate: new Date('2025-08-05'),
                        endDate: new Date('2026-01-15'),
                        status: 'ACTIVE'
                    },
                    {
                        academicYearId: academicYear.id,
                        chapterId: chapter.id,
                        name: 'Semester 2',
                        startDate: new Date('2026-02-10'),
                        endDate: new Date('2026-06-30'),
                        status: 'INACTIVE'
                    }
                ]
            });
        }

        const transactions = [];
        const categories = ['WEEKLY_COLLECTION', 'SPECIAL_OFFERING', 'TITHES', 'WELFARE_DONATION'];
        const expenseCategories = ['FACILITY_MAINTENANCE', 'EVENT_CATERING', 'MINISTRY_SUPPLIES'];
        for (const chapter of chapters) {
            const chapterStudents = chapterStudentMap[chapter.id];
            for (let month = 7; month <= 11; month += 1) {
                for (let wk = 1; wk <= 4; wk += 1) {
                    const date = new Date(2025, month, 3 + wk * 6);
                    const amount = 140 + Math.random() * 560;
                    const student = pickRandom(chapterStudents);
                    const record = await prisma.transaction.create({
                        data: {
                            amount: parseFloat(amount.toFixed(2)),
                            type: 'INCOME',
                            category: pickRandom(categories),
                            description: 'Weekly student fellowship collection',
                            date,
                            chapterId: chapter.id,
                            studentId: student?.id,
                            recordedBy: users[2].email
                        }
                    });
                    transactions.push(record);
                }

                if (Math.random() > 0.35) {
                    const expense = parseFloat((100 + Math.random() * 260).toFixed(2));
                    const record = await prisma.transaction.create({
                        data: {
                            amount: expense,
                            type: 'EXPENSE',
                            category: pickRandom(expenseCategories),
                            description: 'Chapter operational expense',
                            date: new Date(2025, month, 6 + randomInt(0, 8)),
                            chapterId: chapter.id,
                            studentId: null,
                            recordedBy: users[2].email
                        }
                    });
                    transactions.push(record);
                }
            }
        }

        const sessions = [];
        for (const chapter of chapters) {
            const chapterStudents = chapterStudentMap[chapter.id];
            for (let w = 0; w < 8; w += 1) {
                const date = new Date();
                date.setDate(date.getDate() - w * 7);
                const serviceType = w % 2 === 0 ? 'Sunday Service' : 'Midweek Bible Study';
                const total = Math.min(chapterStudents.length, 14 + Math.floor(Math.random() * 22));
                const attendees = chapterStudents.slice(0, total);
                const males = attendees.filter((_, idx) => idx % 2 === 0).length;
                const session = await prisma.attendanceSession.create({
                    data: {
                        chapterId: chapter.id,
                        serviceType,
                        title: `${serviceType} ${w + 1}`,
                        date,
                        speaker: pickRandom(attendanceSpeakers),
                        topic: pickRandom(sermonTopics),
                        totalAttendance: total,
                        totalMales: males,
                        totalFemales: total - males,
                        remarks: 'The chapter gathered strongly for worship and prayer.'
                    }
                });
                sessions.push(session);
                for (const student of attendees.slice(0, Math.min(attendees.length, 12))) {
                    await prisma.attendanceRecord.create({
                        data: {
                            sessionId: session.id,
                            studentId: student.id,
                            checkInMethod: 'QR_CODE',
                            checkedInAt: new Date(date.getTime() + randomInt(0, 45) * 60000)
                        }
                    });
                }
            }
        }

        const events = [];
        for (const eventDef of eventDefinitions) {
            const region = eventDef.regionName ? regions.find(r => r.name === eventDef.regionName) : null;
            const chapter = eventDef.chapterName ? chapters.find(c => c.name === eventDef.chapterName) : null;
            const event = await prisma.event.create({
                data: {
                    title: eventDef.title,
                    description: eventDef.description,
                    date: eventDef.date,
                    endDate: eventDef.endDate,
                    venue: eventDef.venue,
                    category: eventDef.category,
                    scope: eventDef.scope,
                    regionId: region?.id || null,
                    chapterId: chapter?.id || null
                }
            });
            events.push(event);
        }

        const nationalAdmin = await prisma.user.findUnique({ where: { email: 'national@u-chms.gov' } });
        const regionalAdmin = await prisma.user.findUnique({ where: { email: 'regional@u-chms.gov' } });
        const localAdmin = await prisma.user.findUnique({ where: { email: 'local@u-chms.gov' } });

        const auditData = [];
        if (nationalAdmin) {
            auditData.push({ userId: nationalAdmin.id, action: 'LOGIN', entity: 'USER', metadata: 'National admin session initialized' });
            auditData.push({ userId: nationalAdmin.id, action: 'PUBLISH', entity: 'EVENT', metadata: 'National events scheduled for the academic year' });
        }
        if (regionalAdmin) {
            auditData.push({ userId: regionalAdmin.id, action: 'CREATE', entity: 'CHAPTER', metadata: 'Regional admin created new chapter entries' });
            auditData.push({ userId: regionalAdmin.id, action: 'APPROVE', entity: 'CALENDAR', metadata: 'Regional academic calendar reviewed' });
        }
        if (localAdmin) {
            auditData.push({ userId: localAdmin.id, action: 'RECORDED', entity: 'TRANSACTION', metadata: 'Local admin recorded weekly collections' });
            auditData.push({ userId: localAdmin.id, action: 'INITIATED', entity: 'ATTENDANCE', metadata: 'Local admin started attendance sessions' });
        }

        const actionUsers = [nationalAdmin, regionalAdmin, localAdmin].filter(Boolean);
        for (let i = 0; i < 6; i += 1) {
            const user = pickRandom(actionUsers);
            auditData.push({ userId: user.id, action: 'UPDATE', entity: 'REPORT', metadata: `Snapshot ${i + 1} generated` });
        }

        if (auditData.length > 0) {
            await prisma.auditLog.createMany({ data: auditData });
        }

        for (const event of events) {
            const possibleAttendees = event.chapterId
                ? chapterStudentMap[event.chapterId]
                : event.regionId
                    ? allStudents.filter((student) => chapters.some((chapter) => chapter.id === student.chapterId && chapter.regionId === event.regionId))
                    : allStudents;
            const attendeeCount = Math.min(possibleAttendees.length, 8 + randomInt(0, 6));
            const selectedStudents = possibleAttendees.sort(() => 0.5 - Math.random()).slice(0, attendeeCount);
            for (const student of selectedStudents) {
                await prisma.eventRSVP.create({
                    data: {
                        eventId: event.id,
                        studentId: student.id
                    }
                });
            }
        }

        console.log('Seed complete:');
        console.log(`  regions: ${regions.length}`);
        console.log(`  chapters: ${chapters.length}`);
        console.log(`  students: ${allStudents.length}`);
        console.log(`  transactions: ${transactions.length}`);
        console.log(`  attendance sessions: ${sessions.length}`);
        console.log(`  events: ${events.length}`);

        return {
            regions: regions.length,
            chapters: chapters.length,
            students: allStudents.length,
            transactions: transactions.length,
            attendanceSessions: sessions.length,
            events: events.length
        };
    } finally {
        await prisma.$disconnect();
    }
}

if (require.main === module) {
    seedFullData()
        .then(() => console.log('Full demo seed finished successfully.'))
        .catch(error => {
            console.error('Full demo seed failed:', error);
            process.exit(1);
        });
}

module.exports = { seedFullData };