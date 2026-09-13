import initSqlJs, { Database, SqlJsStatic } from 'sql.js';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

let dbInstance: Database | null = null;
const DB_DIR = path.join(process.cwd(), 'database');
const DB_FILE = path.join(DB_DIR, 'wedding.sqlite');

export async function getDatabase(): Promise<Database> {
  if (dbInstance) {
    return dbInstance;
  }

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  const SQL: SqlJsStatic = await initSqlJs();

  if (fs.existsSync(DB_FILE)) {
    try {
      const fileBuffer = fs.readFileSync(DB_FILE);
      dbInstance = new SQL.Database(fileBuffer);
      console.log('SQLite database loaded from existing file.');
    } catch (e) {
      console.warn('Failed to read existing SQLite file, creating fresh database.', e);
      dbInstance = new SQL.Database();
    }
  } else {
    dbInstance = new SQL.Database();
    console.log('Created fresh SQLite database in memory.');
  }

  // Initialize schema
  await initSchema(dbInstance);
  saveDatabase();

  return dbInstance;
}

export function saveDatabase() {
  if (!dbInstance) return;
  try {
    const data = dbInstance.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_FILE, buffer);
  } catch (err) {
    console.error('Error saving SQLite database to disk:', err);
  }
}

async function initSchema(db: Database) {
  // Helper to add column if not exists
  const addColumnIfNotExists = (table: string, column: string, colType: string) => {
    try {
      db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${colType};`);
    } catch {
      // Column already exists
    }
  };

  // Create Admins table
  db.run(`
    CREATE TABLE IF NOT EXISTS admins (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  // Create Wedding Config table
  db.run(`
    CREATE TABLE IF NOT EXISTS wedding_config (
      id TEXT PRIMARY KEY,
      cover_title TEXT DEFAULT 'The Wedding Of',
      groom_name TEXT NOT NULL,
      groom_full_name TEXT NOT NULL,
      groom_parents TEXT NOT NULL,
      groom_instagram TEXT,
      groom_photo TEXT,
      bride_name TEXT NOT NULL,
      bride_full_name TEXT NOT NULL,
      bride_parents TEXT NOT NULL,
      bride_instagram TEXT,
      bride_photo TEXT,
      wedding_date TEXT NOT NULL,
      akad_time TEXT NOT NULL,
      akad_location TEXT NOT NULL,
      akad_address TEXT NOT NULL,
      akad_map_url TEXT,
      resepsi_time TEXT NOT NULL,
      resepsi_location TEXT NOT NULL,
      resepsi_address TEXT NOT NULL,
      resepsi_map_url TEXT,
      quote TEXT NOT NULL,
      quote_source TEXT NOT NULL,
      audio_url TEXT,
      bank_accounts_json TEXT,
      gift_address TEXT,
      gift_receiver TEXT,
      gift_phone TEXT,
      love_story_json TEXT,
      updated_at TEXT NOT NULL
    );
  `);

  // Apply migrations to ensure all columns exist on existing databases
  addColumnIfNotExists('wedding_config', 'cover_title', 'TEXT');
  addColumnIfNotExists('wedding_config', 'groom_photo', 'TEXT');
  addColumnIfNotExists('wedding_config', 'bride_photo', 'TEXT');
  addColumnIfNotExists('wedding_config', 'gift_address', 'TEXT');
  addColumnIfNotExists('wedding_config', 'gift_receiver', 'TEXT');
  addColumnIfNotExists('wedding_config', 'gift_phone', 'TEXT');
  addColumnIfNotExists('wedding_config', 'love_story_json', 'TEXT');
  addColumnIfNotExists('wedding_config', 'wa_template', 'TEXT');
  addColumnIfNotExists('wedding_config', 'video_url', 'TEXT');
  addColumnIfNotExists('wedding_config', 'video_title', 'TEXT');
  addColumnIfNotExists('wedding_config', 'video_description', 'TEXT');

  // Create RSVP table
  db.run(`
    CREATE TABLE IF NOT EXISTS rsvp (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      guests_count INTEGER NOT NULL DEFAULT 1,
      attendance TEXT NOT NULL, -- 'attending' | 'not_attending' | 'tentative'
      message TEXT,
      created_at TEXT NOT NULL
    );
  `);

  // Create Wishes / Guestbook table
  db.run(`
    CREATE TABLE IF NOT EXISTS wishes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      relation TEXT NOT NULL, -- 'Keluarga' | 'Sahabat' | 'Rekan Kerja' | 'Tamu Undangan'
      message TEXT NOT NULL,
      attendance TEXT, -- 'Hadir' | 'Tidak Hadir' | 'Belum Pasti'
      likes INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
  `);

  // Create Gallery table
  db.run(`
    CREATE TABLE IF NOT EXISTS gallery (
      id TEXT PRIMARY KEY,
      url TEXT NOT NULL,
      caption TEXT,
      category TEXT DEFAULT 'prewedding',
      display_order INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );
  `);

  // Seed default Admin if not exists
  const checkAdmin = db.exec("SELECT COUNT(*) as count FROM admins");
  const adminCount = checkAdmin[0]?.values[0]?.[0] || 0;
  if (adminCount === 0) {
    const initialUsername = process.env.ADMIN_INITIAL_USERNAME || 'admin';
    const initialPassword = process.env.ADMIN_INITIAL_PASSWORD || 'weddingAdmin2026!';
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(initialPassword, salt);
    const id = 'admin_master_1';
    const now = new Date().toISOString();

    db.run("INSERT INTO admins (id, username, password_hash, created_at) VALUES (?, ?, ?, ?)", [
      id,
      initialUsername,
      hash,
      now
    ]);
    console.log(`[AUTH] Initial admin seeded: ${initialUsername}`);
  }

  // Seed default Wedding Config if not exists
  const checkConfig = db.exec("SELECT COUNT(*) as count FROM wedding_config");
  const configCount = checkConfig[0]?.values[0]?.[0] || 0;
  const defaultLoveStory = JSON.stringify([
    {
      year: '2021',
      title: 'Awal Pertemuan',
      description: 'Takdir mempertemukan kami di sebuah sudut perpustakaan kota tua. Percakapan santai tentang karya seni dan arsitektur menjadi gerbang benih-benih cinta.'
    },
    {
      year: '2023',
      title: 'Menjalin Komitmen',
      description: 'Dua kepribadian, dua keluarga, bersatu dalam saling pengertian. Kami belajar bertumbuh bersama, saling melengkapi suka dan duka.'
    },
    {
      year: '2025',
      title: 'Untaian Janji / The Proposal',
      description: 'Di bawah taburan bintang di tepi pantai Bali, cincin tanda kesetiaan disematkan. Dengan mata berbinar bahagia, sebuah kata "Yes" mengunci takdir kami.'
    },
    {
      year: '2026',
      title: 'Menuju Hari Abadi',
      description: 'Kini langkah kami bermuara pada janji suci pernikahan. Dengan ridho keluarga dan doa sahabat, kami memulai babak terindah dalam hidup.'
    }
  ]);

  const defaultBankAccounts = JSON.stringify([
    { bank: 'BCA', accountNumber: '8830-192-881', accountName: 'Dimas Pratama' },
    { bank: 'Mandiri', accountNumber: '137-00-198231-9', accountName: 'Althea Maharani' }
  ]);

  if (configCount === 0) {
    db.run(`
      INSERT INTO wedding_config (
        id,
        cover_title,
        groom_name, groom_full_name, groom_parents, groom_instagram, groom_photo,
        bride_name, bride_full_name, bride_parents, bride_instagram, bride_photo,
        wedding_date,
        akad_time, akad_location, akad_address, akad_map_url,
        resepsi_time, resepsi_location, resepsi_address, resepsi_map_url,
        quote, quote_source,
        audio_url, bank_accounts_json, gift_address, gift_receiver, gift_phone, love_story_json, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'default_config',
      'The Wedding Of',
      'Dimas',
      'Dimas Arya Pratama, S.T.',
      'Putra pertama dari Bpk. Bambang Sutrisno & Ibu Sri Wahyuni',
      '@dimas_aryap',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80',
      'Althea',
      'Althea Maharani Putri, M.Ds.',
      'Putri kedua dari Bpk. Hendra Gunawan & Ibu Rina Marlina',
      '@altheamhrn',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80',
      '2026-10-18T09:00:00+07:00',
      '08:00 - 10:00 WIB',
      'Glass House Chapel, The Heritage Grand Ballroom',
      'Jl. Sunset Boulevard No. 88, Menteng, Jakarta Pusat',
      'https://maps.google.com/?q=Jakarta',
      '11:00 - 15:00 WIB',
      'Grand Ballroom & Royal Garden, The Heritage',
      'Jl. Sunset Boulevard No. 88, Menteng, Jakarta Pusat',
      'https://maps.google.com/?q=Jakarta',
      'Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.',
      'QS. Ar-Rum: 21',
      'https://cdn.freesound.org/previews/518/518295_7859343-lq.mp3',
      defaultBankAccounts,
      'Jl. Sunset Boulevard No. 88, Menteng, Jakarta Pusat 10310',
      'Dimas & Althea',
      '0812-3456-7890',
      defaultLoveStory,
      new Date().toISOString()
    ]);
  } else {
    // Populate any NULL values in existing config
    db.run(`
      UPDATE wedding_config SET
        cover_title = COALESCE(cover_title, 'The Wedding Of'),
        groom_photo = COALESCE(groom_photo, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80'),
        bride_photo = COALESCE(bride_photo, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80'),
        gift_address = COALESCE(gift_address, 'Jl. Sunset Boulevard No. 88, Menteng, Jakarta Pusat 10310'),
        gift_receiver = COALESCE(gift_receiver, 'Dimas & Althea'),
        gift_phone = COALESCE(gift_phone, '0812-3456-7890'),
        love_story_json = COALESCE(love_story_json, ?),
        wa_template = COALESCE(wa_template, ?)
      WHERE id = 'default_config'
    `, [defaultLoveStory, `Kepada Yth.
Bapak/Ibu/Saudara/i
*{guest}*
___

Tanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami:

*{groom} & {bride}*

📅 Tanggal: {date}
📍 Lokasi: {location}

Untuk informasi detail acara, rute lokasi, serta konfirmasi kehadiran (RSVP), silakan kunjungi tautan undangan digital kami melalui link berikut:

{link}

Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu bagi kami berdua.

Atas kehadiran dan doa restunya, kami ucapkan terima kasih.

Salam hangat,
*{groom} & {bride}*`]);
  }

  // Seed default wishes if empty
  const checkWishes = db.exec("SELECT COUNT(*) as count FROM wishes");
  const wishesCount = checkWishes[0]?.values[0]?.[0] || 0;
  if (wishesCount === 0) {
    const seedWishes = [
      {
        id: 'wish_1',
        name: 'Rian & Sarah',
        relation: 'Sahabat',
        message: 'Selamat menempuh hidup baru Dimas & Althea! Semoga senantiasa sakinah, mawaddah, warahmah dan selalu dalam limpahan kebahagiaan!',
        attendance: 'Hadir',
        likes: 12,
        created_at: new Date(Date.now() - 3600000 * 24).toISOString()
      },
      {
        id: 'wish_2',
        name: 'Keluarga Besar Bpk. Anton',
        relation: 'Keluarga',
        message: 'Barakallahu laka wa baraka alaika wa jamaa bainakuma fii khoir. Selamat untuk kedua mempelai dan kedua keluarga besar.',
        attendance: 'Hadir',
        likes: 8,
        created_at: new Date(Date.now() - 3600000 * 12).toISOString()
      },
      {
        id: 'wish_3',
        name: 'Tim Tech & Design Studio',
        relation: 'Rekan Kerja',
        message: 'Happy wedding brother Dimas & Althea! Lancar sampai hari H yaa, we are so happy for you both!',
        attendance: 'Hadir',
        likes: 15,
        created_at: new Date(Date.now() - 3600000 * 4).toISOString()
      }
    ];

    for (const w of seedWishes) {
      db.run("INSERT INTO wishes (id, name, relation, message, attendance, likes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)", [
        w.id, w.name, w.relation, w.message, w.attendance, w.likes, w.created_at
      ]);
    }
  }

  // Seed default gallery photos if empty
  const checkGallery = db.exec("SELECT COUNT(*) as count FROM gallery");
  const galleryCount = checkGallery[0]?.values[0]?.[0] || 0;
  if (galleryCount === 0) {
    const seedPhotos = [
      {
        id: 'gal_1',
        url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
        caption: 'Pertemuan Pertama di Senja Kota Tua',
        category: 'prewedding',
        display_order: 1
      },
      {
        id: 'gal_2',
        url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
        caption: 'Langkah Awal Menuju Janji Suci',
        category: 'prewedding',
        display_order: 2
      },
      {
        id: 'gal_3',
        url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
        caption: 'Senyuman Hangat di Bawah Langit Lembayung',
        category: 'prewedding',
        display_order: 3
      },
      {
        id: 'gal_4',
        url: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1200&q=80',
        caption: 'Cincin Abadi Simbol Kesetiaan',
        category: 'ceremony',
        display_order: 4
      },
      {
        id: 'gal_5',
        url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=80',
        caption: 'Kisah Kasih Menatap Masa Depan Bersama',
        category: 'prewedding',
        display_order: 5
      },
      {
        id: 'gal_6',
        url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80',
        caption: 'Dua Jiwa Terikat Dalam Satu Cinta',
        category: 'prewedding',
        display_order: 6
      }
    ];

    for (const p of seedPhotos) {
      db.run("INSERT INTO gallery (id, url, caption, category, display_order, created_at) VALUES (?, ?, ?, ?, ?, ?)", [
        p.id, p.url, p.caption, p.category, p.display_order, new Date().toISOString()
      ]);
    }
  }

  // Seed some initial RSVP
  const checkRsvp = db.exec("SELECT COUNT(*) as count FROM rsvp");
  const rsvpCount = checkRsvp[0]?.values[0]?.[0] || 0;
  if (rsvpCount === 0) {
    db.run("INSERT INTO rsvp (id, name, guests_count, attendance, message, created_at) VALUES (?, ?, ?, ?, ?, ?)", [
      'rsvp_1', 'Rian Santoso', 2, 'attending', 'Insya Allah hadir berdua dengan istri.', new Date().toISOString()
    ]);
    db.run("INSERT INTO rsvp (id, name, guests_count, attendance, message, created_at) VALUES (?, ?, ?, ?, ?, ?)", [
      'rsvp_2', 'Sarah Melinda', 1, 'attending', 'Pasti hadir! Tidak sabar melihat kalian bersanding.', new Date().toISOString()
    ]);
    db.run("INSERT INTO rsvp (id, name, guests_count, attendance, message, created_at) VALUES (?, ?, ?, ?, ?, ?)", [
      'rsvp_3', 'Budi Harsono', 2, 'not_attending', 'Mohon maaf berhalangan hadir karena dinas ke luar kota, doa terbaik kami panjatkan.', new Date().toISOString()
    ]);
  }
}

// Helper: Query all rows as objects
export function queryAll<T = any>(db: Database, sql: string, params: any[] = []): T[] {
  const stmt = db.prepare(sql);
  if (params.length > 0) {
    stmt.bind(params);
  }
  const results: T[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject() as unknown as T);
  }
  stmt.free();
  return results;
}

// Helper: Query one row
export function queryOne<T = any>(db: Database, sql: string, params: any[] = []): T | null {
  const rows = queryAll<T>(db, sql, params);
  return rows.length > 0 ? rows[0] : null;
}
