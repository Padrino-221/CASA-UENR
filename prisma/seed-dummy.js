// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config();
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require('@prisma/client');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Pool } = require('pg');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaPg } = require('@prisma/adapter-pg');

const ghanainNames = [
  'Kofi Mensah', 'Ama Serwaa', 'Kwame Baffour', 'Yaa Boatemaa', 'Ekow Mensah',
  'Abena Konadu', 'Yaw Osei', 'Adjoa Appiah', 'Kojo Antwi', 'Afia Boakye',
  'Kweku Baah', 'Esi Mensah', 'Bernard Akoto', 'Selasi Dogbatse', 'Gifty Koomson',
  'Emanuel Osei', 'Priscilla Addo', 'Derick Owusu', 'Akosua Agyapong', 'Kofi Annan',
  'Maame Yaa', 'Richmond Boadi', 'Dorcas Appiah', 'Prince Boateng', 'Eunice Adjei',
  'Daniel Mensah', 'Rita Ofori', 'Stephen Addo', 'Naomi Serwaa', 'Albert Kwakye'
].flatMap(n => [n, `${n} Jnr`, `${n} II`, `${n} III`]);

const moreNames = [
  'Nana Akua', 'Kwasi Asante', 'Efua Owusu', 'Yaw Boakye', 'Akwele Akuamoah',
  'Kwabena Osei', 'Adwoa Poku', 'Kofi Asare', 'Mawusi Sena', 'Kodwo Addison',
  'Naa Atswei', 'Seth Hlorvor', 'Mabel Quansah', 'John Nunoo', 'Vivian Ahiable',
  'Emmanuel Nkansah', 'Esther Afari', 'David Adom', 'Grace Nyarko', 'John Armah',
  'Lydia Amponsah', 'Michael Okyere', 'Sarah Fosu', 'Samuel Acheampong', 'Hannah Boadi',
  'William Ntow', 'Rebecca Obeng', 'Patrick Turkson', 'Catherine Perbi', 'Joseph Nkrumah',
  'Ernestina Badu', 'Theophilus Tagoe', 'Olivia Asante', 'Philip Ankrah', 'Victoria Ocloo',
  'Isaac Brown', 'Martha Adjei', 'Ebenezer Ofori', 'Georgina Ayisi', 'Matthew Otu',
  'Rosemary Tetteh', 'Kingsley Ackon', 'Deborah Asomani', 'Alex Amoako', 'Edith Vanderpuye',
  'Benjamin Antwi', 'Rose-Mary Acquah', 'Caleb Doku', 'Fiona Agyeman', 'Emmanuel Botchwey',
  'Gloria Annan', 'Solomon Commey', 'Irene Amankwah', 'Noble Akrasi', 'Gifty Nyamekye',
  'Theophilus Okoh', 'Vida Larbi', 'Kwesi Nyarko', 'Juliana Manu', 'Anthony Quaye'
];

const allStudentNames = [...ghanainNames, ...moreNames];

const departments = [
  'Computer Science', 'Business Administration', 'BSc Nursing', 'Mechanical Engineering',
  'LLB Law', 'Economics', 'Medical Sciences', 'Psychology', 'Statistics',
  'Electrical Engineering', 'Civil Engineering', 'BSc Agriculture', 'Pharmacy',
  'Architecture', 'Biochemistry', 'Accounting', 'Banking & Finance',
  'Information Technology', 'Marketing', 'Human Resource Management'
];

const speakers = [
  'Rev. Dr. Mensa Otabil', 'Pastor John Owusu', 'Rev. Emmanuel Asante', 'Pastor Sylvia Addo',
  'Rev. Dr. Mrs. Beatrice Osei', 'Pastor Daniel Agyemang', 'Rev. Isaac Kwofie', 'Pastor Esther Nyarko',
  'Rev. Stephen Tetteh', 'Pastor Grace Opoku', 'Rev. Michael Larbi', 'Pastor Hannah Darko',
  'Rev. Dr. Philip Nkansah', 'Pastor David Quansah', 'Rev. Abraham Boakye', 'Pastor Mercy Amoako',
  'Rev. Dr. Mrs. Victoria Asare', 'Pastor Emmanuel Botwe', 'Rev. Samuel Ofori', 'Pastor Ruth Annan'
];

const sermonTopics = [
  'Walking in Purpose', 'The Power of Unity', 'Faith Beyond the Classroom',
  'Building Character for Leadership', 'Excellence in Every Endeavour',
  'The Salt and Light of the Campus', 'Stewardship and Generosity',
  'Prayer: The Key to Breakthrough', 'Navigating Peer Pressure',
  'Identity in Christ', 'The Fear of the Lord', 'Time Management for Students',
  'Living a Life of Integrity', 'The Armour of God',
  'Overcoming Anxiety and Stress', 'Purpose-Driven Relationships',
  'The Discipline of Daily Devotion', 'Serving with Humility',
  'Financial Wisdom for Students', 'The Power of Mentorship',
  'Staying Rooted in Your Faith', 'Bearing Fruits of Righteousness',
  'The Call to Witness on Campus', 'Transformation Through Worship'
];

const challengesObserved = [
  'Late arrival of some members affected start time',
  'Sound system had intermittent feedback issues',
  'Some students left before the closing prayer',
  'Limited seating caused some members to stand',
  'Offering collection disrupted service flow',
  'First-year engagement was lower than expected',
  'No major challenges observed — service was orderly',
  'Attendance dropped due to mid-semester exams',
  'Light rain caused some members to leave early',
  'The ushering team managed the crowd well despite numbers'
];

const executiveAttitudes = [
  'Executives were punctual and well-prepared',
  'Some executives arrived late; needs improvement',
  'The prayer coordinator led an impactful session',
  'Welfare team proactively followed up on absentees',
  'The media team prepared great visuals',
  'Executives showed good coordination throughout',
  'The financial secretary gave a clear report',
  'The ushering team performed excellently',
  'Some executive roles were unclear during service',
  'The choir was exceptionally well-rehearsed'
];

const remarks = [
  'Overall a blessed and spirit-filled service',
  'The presence of God was tangible throughout',
  'Encouraging to see new faces in attendance',
  'The message deeply resonated with students',
  'A well-organized service from start to finish',
  'Several students gave their lives to Christ',
  'The worship session was particularly moving',
  'Good engagement during the Q&A session',
  'The altar call saw 5 students respond',
  'A powerful night of prayer and intercession',
  'The fellowship afterward strengthened bonds',
  'Many students requested follow-up discipleship'
];

// Common female first-name tokens for rough gender inference
const femaleTokens = new Set([
  'ama', 'abena', 'adjoa', 'afia', 'esi', 'akosua', 'maame', 'yaa',
  'naomi', 'eunice', 'priscilla', 'rita', 'gifty', 'dorcas', 'efua',
  'akwele', 'adwoa', 'mawusi', 'naa', 'mabel', 'vivian', 'esther',
  'grace', 'sarah', 'hannah', 'rebecca', 'catherine', 'olivia',
  'victoria', 'martha', 'georgina', 'rosemary', 'deborah', 'edith',
  'rose-mary', 'fiona', 'gloria', 'irene', 'vida', 'juliana',
  'ernestina', 'lydia', 'mercy', 'ruth', 'sylvia', 'beatrice',
  'hannah', 'rose', 'charlotte', 'margaret', 'elizabeth', 'jane',
  'linda', 'sandra', 'monica', 'patience', 'vera', 'jennifer'
]);

function isLikelyMale(name) {
  const firstToken = name.split(/\s+/)[0].toLowerCase();
  return !femaleTokens.has(firstToken);
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function round2(n) {
  return parseFloat(n.toFixed(2));
}

async function main() {
  console.log('Starting full-year database seed with all 16 regions of Ghana...\n');

  const connectionString = process.env.DATABASE_URL;
  const isLocal = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');
  const pool = new Pool({
    connectionString,
    ssl: isLocal ? false : { rejectUnauthorized: false },
    max: 20,
    idleTimeoutMillis: 60000,
    connectionTimeoutMillis: 30000
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    // ── Fetch admin users ──
    console.log('Fetching administrative users...');
    const nationalUser = await prisma.user.findFirst({ where: { role: 'NATIONAL_ADMIN' } });
    const regionalUser = await prisma.user.findFirst({ where: { role: 'REGIONAL_ADMIN' } });
    const localUser = await prisma.user.findFirst({ where: { role: 'LOCAL_ADMIN' } });

    if (!nationalUser || !regionalUser || !localUser) {
      throw new Error('Required admin users not found. Run seed-auth first!');
    }

    // ── Clear existing dummy data ──
    console.log('Clearing previous dummy data...');
    await prisma.eventRSVP.deleteMany({});
    await prisma.event.deleteMany({});
    await prisma.attendanceRecord.deleteMany({});
    await prisma.attendanceSession.deleteMany({});
    await prisma.transaction.deleteMany({});
    await prisma.student.deleteMany({});
    await prisma.semester.deleteMany({});
    await prisma.academicYear.deleteMany({});
    await prisma.user.updateMany({
      where: { role: { in: ['REGIONAL_ADMIN', 'LOCAL_ADMIN'] } },
      data: { chapterId: null, regionId: null }
    });
    await prisma.chapter.deleteMany({});
    console.log('Cleanup complete.\n');

    // ── 1. Create all 16 regions of Ghana ──
    console.log('Creating all 16 regions of Ghana...');
    const regionDefinitions = [
      { name: 'Greater Accra Region',     description: 'Greater Accra — national capital region, most densely populated' },
      { name: 'Ashanti Region',           description: 'Ashanti Region — heartland of the Ashanti Kingdom, central Ghana' },
      { name: 'Central Region',           description: 'Central Region — coastal region, historic Cape Coast castle' },
      { name: 'Western Region',           description: 'Western Region — mineral-rich coastal region, Sekondi-Takoradi' },
      { name: 'Western North Region',     description: 'Western North Region — forest region, Sefwi-Wiawso capital' },
      { name: 'Volta Region',             description: 'Volta Region — eastern Ghana, Volta Lake, Ho capital' },
      { name: 'Oti Region',               description: 'Oti Region — northern Volta basin, Dambai capital' },
      { name: 'Eastern Region',           description: 'Eastern Region — ancient botanical garden, Koforidua capital' },
      { name: 'Bono Region',              description: 'Bono Region — cocoa-producing region, Sunyani capital' },
      { name: 'Bono East Region',         description: 'Bono East Region — Techiman capital, agricultural hub' },
      { name: 'Ahafo Region',             description: 'Ahafo Region — forest region, Goaso capital' },
      { name: 'Northern Region',          description: 'Northern Region — largest region, Tamale capital' },
      { name: 'Savannah Region',          description: 'Savannah Region — guinea savannah, Damongo capital' },
      { name: 'North East Region',        description: 'North East Region — Nalerigu capital, diverse ethnic groups' },
      { name: 'Upper East Region',        description: 'Upper East Region — Bolgatanga capital, Sahel climate' },
      { name: 'Upper West Region',        description: 'Upper West Region — Wa capital, along Black Volta' }
    ];

    const regions = [];
    for (const def of regionDefinitions) {
      const reg = await prisma.region.upsert({
        where: { name: def.name },
        update: { description: def.description },
        create: { name: def.name, description: def.description }
      });
      regions.push(reg);
    }
    console.log(`Created ${regions.length} regions.\n`);

    // ── 2. Create chapters (real tertiary institutions spread across regions) ──
    console.log('Registering chapters with real tertiary institutions...');

    const chapterDefinitions = [
      // Greater Accra (idx 0) — 5 chapters
      { name: 'UG Legon Chapter',        university: 'University of Ghana',              campus: 'Legon',         regionIdx: 0 },
      { name: 'UPSA Chapter',            university: 'University of Professional Studies',campus: 'Madina',        regionIdx: 0 },
      { name: 'UNIMAC-GIJ Chapter',      university: 'UNIMAC (Ghana Institute of Journalism)', campus: 'Accra',     regionIdx: 0 },
      { name: 'Accra Technical Chapter', university: 'Accra Technical University',        campus: 'Accra',         regionIdx: 0 },
      { name: 'GCTU Chapter',            university: 'Ghana Communication Tech University', campus: 'Tesano',       regionIdx: 0 },

      // Ashanti (idx 1) — 4 chapters
      { name: 'KNUST Chapter',           university: 'Kwame Nkrumah Univ of Science & Tech', campus: 'Kumasi',       regionIdx: 1 },
      { name: 'KsTU Chapter',            university: 'Kumasi Technical University',        campus: 'Kumasi',        regionIdx: 1 },
      { name: 'Christian Service Chapter', university: 'Christian Service University College', campus: 'Santasi',    regionIdx: 1 },

      // Central (idx 2) — 2 chapters
      { name: 'UCC Chapter',             university: 'University of Cape Coast',           campus: 'Cape Coast',    regionIdx: 2 },
      { name: 'Cape Coast Tech Chapter', university: 'Cape Coast Technical University',    campus: 'Cape Coast',    regionIdx: 2 },

      // Western (idx 3) — 2 chapters
      { name: 'UMaT Chapter',            university: 'University of Mines & Technology',   campus: 'Tarkwa',        regionIdx: 3 },
      { name: 'Takoradi Tech Chapter',   university: 'Takoradi Technical University',      campus: 'Takoradi',      regionIdx: 3 },

      // Western North (idx 4) — 1 chapter
      { name: 'Bibiani College Chapter', university: 'Bibiani College of Education',       campus: 'Bibiani',       regionIdx: 4 },

      // Volta (idx 5) — 2 chapters
      { name: 'UHAS Chapter',            university: 'Univ of Health & Allied Sciences',   campus: 'Ho',            regionIdx: 5 },
      { name: 'HoTU Chapter',            university: 'Ho Technical University',            campus: 'Ho',            regionIdx: 5 },

      // Oti (idx 6) — 1 chapter
      { name: 'Dambai College Chapter',  university: 'Dambai College of Education',        campus: 'Dambai',        regionIdx: 6 },

      // Eastern (idx 7) — 2 chapters
      { name: 'KTU Chapter',             university: 'Koforidua Technical University',     campus: 'Koforidua',     regionIdx: 7 },
      { name: 'Presbyterian Univ Chapter', university: 'Presbyterian University College',  campus: 'Abetifi',       regionIdx: 7 },

      // Bono (idx 8) — 2 chapters
      { name: 'UENR Chapter',            university: 'Univ of Energy & Natural Resources', campus: 'Sunyani',       regionIdx: 8 },
      { name: 'Sunyani Tech Chapter',    university: 'Sunyani Technical University',       campus: 'Sunyani',       regionIdx: 8 },

      // Bono East (idx 9) — 1 chapter
      { name: 'Techiman College Chapter', university: 'Techiman College of Education',     campus: 'Techiman',      regionIdx: 9 },

      // Ahafo (idx 10) — 1 chapter
      { name: 'Goaso College Chapter',   university: 'Goaso College of Education',         campus: 'Goaso',         regionIdx: 10 },

      // Northern (idx 11) — 2 chapters
      { name: 'UDS Chapter',             university: 'University for Development Studies', campus: 'Tamale',        regionIdx: 11 },
      { name: 'Tamale Tech Chapter',     university: 'Tamale Technical University',        campus: 'Tamale',        regionIdx: 11 },

      // Savannah (idx 12) — 1 chapter
      { name: 'Damango College Chapter', university: 'Damango College of Education',       campus: 'Damango',       regionIdx: 12 },

      // North East (idx 13) — 1 chapter
      { name: 'Nalerigu College Chapter',university: 'Nalerigu College of Education',      campus: 'Nalerigu',      regionIdx: 13 },

      // Upper East (idx 14) — 2 chapters
      { name: 'Bolgatanga Tech Chapter', university: 'Bolgatanga Technical University',    campus: 'Bolgatanga',    regionIdx: 14 },
      { name: 'CK Tedam Chapter',        university: 'C.K. Tedam Univ of Tech & Applied Sciences', campus: 'Navrongo', regionIdx: 14 },

      // Upper West (idx 15) — 1 chapter
      { name: 'SDD-UBIDS Chapter',       university: 'SDD-UBIDS',                          campus: 'Wa',            regionIdx: 15 },
    ];

    const chapters = [];
    for (const def of chapterDefinitions) {
      // spread chapter creation dates across academic year for realism
      const month = randomInt(8, 12);  // Aug - Dec 2025
      const day = randomInt(1, 25);
      const ch = await prisma.chapter.create({
        data: {
          name: def.name,
          university: def.university,
          campus: def.campus,
          regionId: regions[def.regionIdx].id,
          createdAt: new Date(2025, month - 1, day)
        }
      });
      chapters.push(ch);
    }
    console.log(`Created ${chapters.length} chapters.\n`);

    // re-associate seeded admins
    await prisma.user.update({
      where: { id: regionalUser.id },
      data: { regionId: regions[0].id }
    });
    await prisma.user.update({
      where: { id: localUser.id },
      data: { chapterId: chapters[0].id }
    });

    // ── 3. Academic years & semesters ──
    console.log('Creating academic years & semesters...');
    const semestersMap = [];
    for (const ch of chapters) {
      const acadYear = await prisma.academicYear.create({
        data: {
          name: '2025/2026 Academic Year',
          startDate: new Date('2025-08-01'),
          endDate: new Date('2026-06-30'),
          isCurrent: true,
          chapterId: ch.id
        }
      });
      const sem = await prisma.semester.create({
        data: {
          name: 'Semester 1',
          academicYearId: acadYear.id,
          chapterId: ch.id,
          startDate: new Date('2025-08-05'),
          endDate: new Date('2026-05-31'),
          status: 'ACTIVE'
        }
      });
      semestersMap.push({ chId: ch.id, semId: sem.id });
    }
    console.log(`Created academic years & semesters for ${chapters.length} chapters.\n`);

    // ── 4. Students ──
    console.log('Generating student records...');
    const studentData = [];
    for (let i = 0; i < allStudentNames.length && i < 200; i++) {
      const ch = chapters[i % chapters.length];
      const name = allStudentNames[i] + (i >= allStudentNames.length ? ` ${i}` : '');
      const studentId = `UC-${100000 + i}`;
      const email = `${name.toLowerCase().replace(/\s+/g, '.')}@student.edu.gh`;
      const levelYear = `${((i % 4) + 1) * 100}`;
      const isLeader = i % 15 === 0;

      studentData.push({
        studentId,
        name,
        email,
        phone: `+23354${String(1000000 + i).slice(0, 7)}`,
        department: pickRandom(departments),
        levelYear,
        status: 'ACTIVE',
        isLeader,
        position: isLeader ? pickRandom(['Chapel Committee Head', 'Prayer Coordinator', 'Welfare Lead', 'Financial Secretary', 'Media Lead']) : null,
        memberQrCode: `QR-CODE-STUDENT-${studentId}`,
        chapterId: ch.id,
        enrollmentDate: new Date(2025, 7 + (i % 4), (i % 28) + 1)
      });
    }
    await prisma.student.createMany({ data: studentData });
    const students = await prisma.student.findMany({ orderBy: { studentId: 'asc' } });
    console.log(`Created ${students.length} students.\n`);

    // ── 5. Financial transactions (realistic, varying by chapter size) ──
    console.log('Injecting realistic financial transactions spanning Aug 2025 - Jun 2026...');
    let txCount = 0;

    // Chapter size tiers (bigger chapters = more students = more offerings)
    const bigChapters = new Set(['UG Legon Chapter', 'KNUST Chapter', 'UCC Chapter', 'UPSA Chapter', 'UDS Chapter']);
    const mediumChapters = new Set(['KsTU Chapter', 'UNIMAC-GIJ Chapter', 'UHAS Chapter', 'UENR Chapter',
      'Takoradi Tech Chapter', 'Accra Technical Chapter', 'KTU Chapter', 'HoTU Chapter',
      'Bolgatanga Tech Chapter', 'SDD-UBIDS Chapter', 'Tamale Tech Chapter', 'CK Tedam Chapter',
      'Christian Service Chapter', 'GCTU Chapter', 'Presbyterian Univ Chapter']);

    function chapterSizeMultiplier(name) {
      if (bigChapters.has(name)) return 1.0;
      if (mediumChapters.has(name)) return 0.65;
      return 0.4;
    }

    const months = [
      { m: 7,  year: 2025, label: 'Aug 2025' },
      { m: 8,  year: 2025, label: 'Sep 2025' },
      { m: 9,  year: 2025, label: 'Oct 2025' },
      { m: 10, year: 2025, label: 'Nov 2025' },
      { m: 11, year: 2025, label: 'Dec 2025' },
      { m: 0,  year: 2026, label: 'Jan 2026' },
      { m: 1,  year: 2026, label: 'Feb 2026' },
      { m: 2,  year: 2026, label: 'Mar 2026' },
      { m: 3,  year: 2026, label: 'Apr 2026' },
      { m: 4,  year: 2026, label: 'May 2026' },
      { m: 5,  year: 2026, label: 'Jun 2026' },
    ];

    const weekDays = [5, 12, 19, 26];

    const allTxData = [];
    for (const ch of chapters) {
      const semester = semestersMap.find(s => s.chId === ch.id);
      const size = chapterSizeMultiplier(ch.name);
      const chStudents = students.filter(s => s.chapterId === ch.id);

      for (const month of months) {
        const chCreateMonth = ch.createdAt.getMonth();
        if (month.m < chCreateMonth) continue;

        for (const d of weekDays) {
          if (Math.random() > 0.82) continue;

          const date = new Date(month.year, month.m, d);
          if (date > new Date()) continue;

          const isSpecial = Math.random() < 0.15;
          const category = isSpecial ? 'SPECIAL_OFFERING' : pickRandom(
            ['WEEKLY_COLLECTION', 'WEEKLY_COLLECTION', 'WEEKLY_COLLECTION', 'TITHES', 'WELFARE_DONATION']
          );

          let amount;
          if (category === 'SPECIAL_OFFERING') {
            amount = round2((800 + Math.random() * 2200) * size * (0.8 + Math.random() * 0.4));
          } else if (category === 'WEEKLY_COLLECTION') {
            amount = round2((250 + Math.random() * 800) * size * (0.85 + Math.random() * 0.3));
          } else if (category === 'TITHES') {
            amount = round2((50 + Math.random() * 200) * size * (0.9 + Math.random() * 0.2));
          } else if (category === 'WELFARE_DONATION') {
            amount = round2((100 + Math.random() * 250) * size * (0.9 + Math.random() * 0.2));
          } else {
            amount = round2((300 + Math.random() * 700) * size * (0.9 + Math.random() * 0.2));
          }

          if (month.m === 11) amount = round2(amount * (1.15 + Math.random() * 0.25));
          if (month.m === 0) amount = round2(amount * 0.75);
          if (amount < 10) amount = 10;

          const std = chStudents.length > 0 ? pickRandom(chStudents) : null;

          if (Math.random() < 0.03) {
            allTxData.push({
              amount: round2((1000 + Math.random() * 4000) * size),
              type: 'INCOME',
              category: 'PROJECT_FUND',
              description: `Special project fund contribution — ${pickRandom(['Building project', 'Conference hosting', 'Evangelism outreach', 'Welfare support fund'])}`,
              date,
              semesterId: semester ? semester.semId : null,
              chapterId: ch.id,
              studentId: std ? std.id : null,
              recordedBy: localUser.id
            });
          }

          allTxData.push({
            amount,
            type: 'INCOME',
            category,
            description: `${category === 'SPECIAL_OFFERING' ? 'Special' : 'Weekly'} ${category.replace('_', ' ').toLowerCase()} — ${date.toISOString().slice(0, 10)}`,
            date,
            semesterId: semester ? semester.semId : null,
            chapterId: ch.id,
            studentId: std ? std.id : null,
            recordedBy: localUser.id
          });
        }
      }

      const expenseChapters = chapters.filter((_, i) => i % 3 === 0);
      if (expenseChapters.includes(ch)) {
        const expenseMonths = [8, 9, 10, 11, 0, 1, 2, 3, 4, 5];
        for (const m of expenseMonths) {
          if (Math.random() > 0.5) continue;
          const expenseDate = new Date(2026, m, randomInt(10, 28));
          if (expenseDate > new Date()) continue;

          allTxData.push({
            amount: round2((50 + Math.random() * 300) * size),
            type: 'EXPENSE',
            category: pickRandom(['WELFARE_DONATION', 'PROJECT_FUND']),
            description: pickRandom([
              'Welfare support for member', 'Event refreshments',
              'Transport for outreach', 'Printing & stationery',
              'Utility contribution', 'Music equipment maintenance'
            ]),
            date: expenseDate,
            semesterId: semester ? semester.semId : null,
            chapterId: ch.id,
            studentId: null,
            recordedBy: localUser.id
          });
        }
      }
    }
    if (allTxData.length > 0) {
      await prisma.transaction.createMany({ data: allTxData });
    }
    txCount = allTxData.length;
    console.log(`Created ${txCount} financial transactions.\n`);

    // ── 6. Attendance sessions & records ──
    console.log('Seeding attendance sessions and records...');
    const serviceTypes = ['Sunday Service', 'Midweek Service', 'Friday Prayer Vigil'];
    const attendanceImages = [
      '/uploads/attendance/service-01.jpeg',
      '/uploads/attendance/service-02.jpeg',
      '/uploads/attendance/service-03.jpeg',
      '/uploads/attendance/service-04.jpeg',
      '/uploads/attendance/service-05.jpeg',
      '/uploads/attendance/conference-01.jpg',
      '/uploads/attendance/cmq6awz7i0000qwuolmiishha_1780989343518.jpeg',
      '/uploads/attendance/cmq6awz7i0000qwuolmiishha_1780989222353.jpeg',
      '/uploads/attendance/cmq6awz7i0000qwuolmiishha_1780989120135.jpeg'
    ];
    let imageIdx = 0;
    let sessionCount = 0;
    let recordCount = 0;

    const allSessionData = [];
    const allRecordData = [];
    for (const ch of chapters) {
      const chStudents = students.filter(s => s.chapterId === ch.id);
      if (chStudents.length < 2) continue;

      for (let w = 0; w < 16; w++) {
        const date = new Date();
        date.setDate(date.getDate() - (w * 7));
        if (date < new Date('2025-08-01')) continue;

        const serviceType = serviceTypes[w % serviceTypes.length];
        const title = `${serviceType} Week ${16 - w}`;
        const imageUrl = (w % 4 === 0) ? attendanceImages[imageIdx++ % attendanceImages.length] : null;

        const attendanceRate = 0.55 + Math.random() * 0.35;
        const attendeeCount = Math.min(chStudents.length, Math.floor(chStudents.length * attendanceRate));

        const attendees = [...chStudents]
          .sort(() => 0.5 - Math.random())
          .slice(0, attendeeCount);

        let males = 0;
        let females = 0;
        for (const student of attendees) {
          if (isLikelyMale(student.name)) males++; else females++;
        }

        allSessionData.push({
          chapterId: ch.id,
          serviceType,
          title,
          date,
          imageUrl,
          totalAttendance: attendeeCount,
          totalMales: males,
          totalFemales: females,
          speaker: pickRandom(speakers),
          topic: pickRandom(sermonTopics),
          challenges: Math.random() > 0.65 ? pickRandom(challengesObserved) : null,
          attitudeOfExecutives: Math.random() > 0.55 ? pickRandom(executiveAttitudes) : null,
          remarks: Math.random() > 0.6 ? pickRandom(remarks) : null,
          _attendees: attendees,
          _date: date
        });
      }
    }

    if (allSessionData.length > 0) {
      await prisma.attendanceSession.createMany({ data: allSessionData.map(s => ({
        chapterId: s.chapterId,
        serviceType: s.serviceType,
        title: s.title,
        date: s.date,
        imageUrl: s.imageUrl,
        totalAttendance: s.totalAttendance,
        totalMales: s.totalMales,
        totalFemales: s.totalFemales,
        speaker: s.speaker,
        topic: s.topic,
        challenges: s.challenges,
        attitudeOfExecutives: s.attitudeOfExecutives,
        remarks: s.remarks
      })) });

      const createdSessions = await prisma.attendanceSession.findMany({
        where: { chapterId: { in: chapters.map(c => c.id) } },
        orderBy: { createdAt: 'asc' }
      });
      sessionCount = createdSessions.length;

      for (let i = 0; i < createdSessions.length; i++) {
        const sessionDef = allSessionData[i];
        const attendees = sessionDef._attendees;
        for (const student of attendees) {
          allRecordData.push({
            sessionId: createdSessions[i].id,
            studentId: student.id,
            checkInMethod: Math.random() > 0.25 ? 'QR_CODE' : 'MANUAL',
            checkedInAt: new Date(sessionDef._date.getTime() + randomInt(0, 45) * 60 * 1000)
          });
        }
      }

      if (allRecordData.length > 0) {
        await prisma.attendanceRecord.createMany({ data: allRecordData });
      }
      recordCount = allRecordData.length;
    }
    console.log(`Created ${sessionCount} sessions with ${recordCount} records.\n`);

    // ── 7. Events ──
    console.log('Creating events...');
    const firstChapter = chapters[0];
    const firstRegion = regions[0];

    await prisma.event.createMany({
      data: [
        {
          title: 'CASA National Leadership Conference',
          description: 'Annual leadership retreat for all chapter executives across Ghana.',
          date: new Date('2026-07-14T10:00:00Z'),
          endDate: new Date('2026-07-17T16:00:00Z'),
          venue: 'Anakazo Retreat Center, Eastern Region',
          category: 'Leadership',
          scope: 'NATIONAL',
          chapterId: null, regionId: null
        },
        {
          title: 'National Youth Convocation',
          description: 'Week-long gathering of students for revival, networking and empowerment.',
          date: new Date('2026-08-10T09:00:00Z'),
          endDate: new Date('2026-08-14T17:00:00Z'),
          venue: 'Cape Coast Conference Center',
          category: 'Fellowship',
          scope: 'NATIONAL',
          chapterId: null, regionId: null
        },
        {
          title: 'Greater Accra Regional Outreach',
          description: 'Community evangelism and clean-up exercise across Accra.',
          date: new Date('2026-09-20T08:00:00Z'),
          endDate: new Date('2026-09-20T16:00:00Z'),
          venue: 'Independence Square, Accra',
          category: 'Outreach',
          scope: 'REGIONAL',
          chapterId: null, regionId: firstRegion.id
        },
        {
          title: 'Ashanti Regional Worship Night',
          description: 'Combined worship and prayer night for all Ashanti chapters.',
          date: new Date('2026-10-15T17:00:00Z'),
          endDate: new Date('2026-10-15T22:00:00Z'),
          venue: 'KNUST CCB Auditorium, Kumasi',
          category: 'Fellowship',
          scope: 'REGIONAL',
          chapterId: null, regionId: regions[1].id
        },
        {
          title: 'UG Legon Freshers Welcome',
          description: 'Welcome party for newly admitted students.',
          date: new Date('2026-01-25T14:00:00Z'),
          endDate: new Date('2026-01-25T20:00:00Z'),
          venue: 'UG Great Hall, Legon',
          category: 'Social',
          scope: 'LOCAL',
          chapterId: firstChapter.id, regionId: null
        },
        {
          title: 'KNUST Prayer Camp',
          description: 'Weekend prayer retreat for KNUST chapter members.',
          date: new Date('2026-03-05T15:00:00Z'),
          endDate: new Date('2026-03-07T12:00:00Z'),
          venue: 'Wesley Girls Prayer Grounds',
          category: 'Prayer',
          scope: 'LOCAL',
          chapterId: chapters.find(c => c.name.includes('KNUST'))?.id || null,
          regionId: null
        },
        {
          title: 'Northern Sector Games',
          description: 'Inter-chapter sports and games for northern chapters.',
          date: new Date('2026-05-01T08:00:00Z'),
          endDate: new Date('2026-05-02T18:00:00Z'),
          venue: 'Tamale Sports Stadium',
          category: 'Sports',
          scope: 'REGIONAL',
          chapterId: null, regionId: regions[11].id
        },
        {
          title: 'End of Year Thanksgiving',
          description: 'Combined thanksgiving service to close the academic year.',
          date: new Date('2026-06-20T09:00:00Z'),
          endDate: new Date('2026-06-20T14:00:00Z'),
          venue: 'National Theatre, Accra',
          category: 'Fellowship',
          scope: 'NATIONAL',
          chapterId: null, regionId: null
        }
      ]
    });
    console.log('Created 8 events.\n');

    // ── 8. Audit logs ──
    console.log('Creating audit logs...');
    await prisma.auditLog.createMany({
      data: [
        { action: 'LOGIN', entity: 'USER', metadata: 'Successful dashboard login', userId: nationalUser.id, createdAt: new Date(Date.now() - 0 * 3 * 60 * 60 * 1000) },
        { action: 'CREATE', entity: 'STUDENT', metadata: 'Registered new student member', userId: regionalUser.id, createdAt: new Date(Date.now() - 1 * 3 * 60 * 60 * 1000) },
        { action: 'RECORDED', entity: 'COLLECTION', metadata: 'Recorded weekly offering collection', userId: localUser.id, createdAt: new Date(Date.now() - 2 * 3 * 60 * 60 * 1000) },
        { action: 'CREATE', entity: 'ATTENDANCE', metadata: 'Created attendance session', userId: nationalUser.id, createdAt: new Date(Date.now() - 3 * 3 * 60 * 60 * 1000) },
        { action: 'LOADED', entity: 'CALENDAR', metadata: 'Synchronized academic calendar', userId: regionalUser.id, createdAt: new Date(Date.now() - 4 * 3 * 60 * 60 * 1000) },
        { action: 'UPDATE', entity: 'STUDENT', metadata: 'Updated student profile information', userId: localUser.id, createdAt: new Date(Date.now() - 5 * 3 * 60 * 60 * 1000) },
        { action: 'CHECKIN', entity: 'ATTENDANCE', metadata: 'Student checked in via QR code', userId: nationalUser.id, createdAt: new Date(Date.now() - 6 * 3 * 60 * 60 * 1000) },
        { action: 'CREATE', entity: 'EVENT', metadata: 'Created new event on calendar', userId: regionalUser.id, createdAt: new Date(Date.now() - 7 * 3 * 60 * 60 * 1000) },
        { action: 'UPDATE', entity: 'REGION', metadata: 'Updated regional configuration', userId: localUser.id, createdAt: new Date(Date.now() - 8 * 3 * 60 * 60 * 1000) },
        { action: 'CREATE', entity: 'CHAPTER', metadata: 'Registered new chapter', userId: nationalUser.id, createdAt: new Date(Date.now() - 9 * 3 * 60 * 60 * 1000) }
      ]
    });
    console.log('Created 10 audit logs.\n');

    console.log('=== DATABASE POPULATION COMPLETE ===');
    console.log(`  Regions:    ${regions.length}`);
    console.log(`  Chapters:   ${chapters.length}`);
    console.log(`  Students:   ${students.length}`);
    console.log(`  Transacts:  ${txCount}`);
    console.log(`  Attend sess:${sessionCount}`);
    console.log(`  Attend recs:${recordCount}`);
    console.log('  Events:     8');
    console.log('  Audit logs: 10');
    console.log('');
  } catch (error) {
    console.error('Seed failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
