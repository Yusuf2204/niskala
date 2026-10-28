// Component Registry for Niskala Visual Editor
// Defines all available section types, default props, descriptions, and icon representations.

export const COMPONENT_REGISTRY = {
  HeroCover: {
    type: 'HeroCover',
    name: 'Cover & Pembuka',
    category: 'Inti',
    description: 'Bagian utama pembuka undangan dengan foto latar dan judul acara.',
    icon: 'cilStar',
    defaultProps: {
      title: 'The Wedding Of',
      primary_names: 'Rama & Shinta',
      date_text: 'Sabtu, 12 Desember 2026',
      quote: 'Maha Suci Allah yang telah menciptakan makhluk-Nya berpasang-pasangan.',
      bg_image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
      open_button_text: 'Buka Undangan',
      guest_greeting_prefix: 'Kepada Yth. Bapak/Ibu/Saudara/i:',
      text_align: 'center',
    },
  },
  CoupleProfile: {
    type: 'CoupleProfile',
    name: 'Profil Mempelai',
    category: 'Mempelai',
    description: 'Foto dan profil mempelai pria serta wanita beserta nama orang tua.',
    icon: 'cilPeople',
    defaultProps: {
      section_title: 'Mempelai Pria & Wanita',
      quote:
        'Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud menyelenggarakan syukuran pernikahan putra-putri kami:',
      groom_name: 'Rama Wijaya, S.Kom.',
      groom_parents: 'Putra pertama dari Bpk. Danu Wijaya & Ibu Maya Kartika',
      groom_photo:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
      groom_instagram: '@ramawijaya',
      bride_name: 'Shinta Dewi, S.E.',
      bride_parents: 'Putri kedua dari Bpk. Surya Pratama & Ibu Ratna Sari',
      bride_photo:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
      bride_instagram: '@shintadewi',
    },
  },
  CountdownTimer: {
    type: 'CountdownTimer',
    name: 'Countdown Acara',
    category: 'Acara',
    description: 'Penghitung mundur hari, jam, menit, dan detik menuju waktu acara.',
    icon: 'cilClock',
    defaultProps: {
      title: 'Menghitung Hari Bahagia',
      target_date: '2026-12-12T09:00:00',
      description: 'Tiada yang lebih membahagiakan selain kehadiran Anda di hari istimewa kami.',
    },
  },
  EventSchedule: {
    type: 'EventSchedule',
    name: 'Rangkaian Acara',
    category: 'Acara',
    description: 'Daftar jadwal acara lengkap (Akad, Resepsi, Syukuran) dengan waktu dan lokasi.',
    icon: 'cilCalendar',
    defaultProps: {
      title: 'Rangkaian Acara',
      subtitle: 'Waktu & Tempat Pelaksanaan',
      events: [
        {
          id: '1',
          name: 'Akad Nikah',
          date: 'Sabtu, 12 Desember 2026',
          time: '08:00 - 10:00 WIB',
          location: 'Masjid Agung Al-Azhar',
          address: 'Jl. Sisingamangaraja, Kebayoran Baru, Jakarta Selatan',
        },
        {
          id: '2',
          name: 'Resepsi Pernikahan',
          date: 'Sabtu, 12 Desember 2026',
          time: '11:00 - 14:00 WIB',
          location: 'Grand Ballroom Hotel Mulia',
          address: 'Jl. Asia Afrika, Senayan, Jakarta Pusat',
        },
      ],
    },
  },
  TraditionAccordion: {
    type: 'TraditionAccordion',
    name: 'Accordion Acara Adat & Hiasan',
    category: 'Acara & Tradisi',
    description:
      'Accordion berornamen Gunungan Wayang untuk prosesi adat sakral (Siraman, Midodareni, Akad, Panggih).',
    icon: 'cilList',
    defaultProps: {
      title: 'Tata Upacara & Prosesi Adat Jawa',
      subtitle: 'Rangkaian Ritual Suci Sakral Penganten Jawa',
      ornament: 'gunungan',
      items: [
        {
          id: 'item-1',
          title: 'Upacara Siraman',
          time_info: 'Jumat Pon, 11 Desember 2026 — 09:00 WIB',
          location: 'Kediaman Mempelai Putri',
          description:
            'Upacara sesuci raga dalah jiwa calon penganten kanthi toya pitu sumber kembang setaman, pinangka lambang reresik lair lan batin sadurunge ngambah gesang anyar.',
        },
        {
          id: 'item-2',
          title: 'Malam Midodareni',
          time_info: 'Jumat Pon, 11 Desember 2026 — 19:00 WIB',
          location: 'Kediaman Mempelai Putri',
          description:
            'Wanci wengi ing ngendi para widadari mudhun maringi berkah kaendahan, kasekten, lan karaharjan dhumateng calon penganten putri.',
        },
        {
          id: 'item-3',
          title: 'Ijab Kabul / Akad Nikah',
          time_info: 'Sabtu Pahing, 12 Desember 2026 — 08:00 WIB',
          location: 'Pendopo Ageng Handrawina',
          description:
            'Ikrar suci prajanjen nikah ing ngarsanipun Gusti Allah SWT, saksi, para sepuh, lan wali.',
        },
        {
          id: 'item-4',
          title: 'Upacara Panggih Penganten',
          time_info: 'Sabtu Pahing, 12 Desember 2026 — 10:00 WIB',
          location: 'Sasana Hinggil Handrawina',
          description:
            'Temuning sri penganten kakung lan putri lumantar prosesi adat Balangan Gantal, Wijik Suku/Ngidak Endhog, Sinduran, Kacar Kucur, Dahar Klimah, lan Sungkeman.',
        },
        {
          id: 'item-5',
          title: 'Pahargyan Temu Manten (Resepsi)',
          time_info: 'Sabtu Pahing, 12 Desember 2026 — 11:30 - 14:00 WIB',
          location: 'Grand Ballroom Handrawina',
          description:
            'Syukuran agung bebarengan para tamu rawuh kinurmatan dalah sedherek kanthi suwasana pinarak gamelan lan beksan Jawa.',
        },
      ],
    },
  },
  LocationMap: {
    type: 'LocationMap',
    name: 'Lokasi & Peta',
    category: 'Lokasi',
    description: 'Sematkan denah Google Maps dan tombol petunjuk arah langsung.',
    icon: 'cilLocationPin',
    defaultProps: {
      title: 'Lokasi & Peta Acara',
      venue_name: 'Grand Ballroom Hotel Mulia',
      address: 'Jl. Asia Afrika, Senayan, Jakarta Pusat, DKI Jakarta',
      maps_embed_url:
        'https://maps.google.com/maps?q=Hotel+Mulia+Senayan+Jakarta&t=&z=15&ie=UTF8&iwloc=&output=embed',
      maps_direction_url: 'https://maps.google.com/?q=Hotel+Mulia+Senayan+Jakarta',
      button_label: 'Buka di Google Maps',
    },
  },
  PhotoGallery: {
    type: 'PhotoGallery',
    name: 'Galeri Foto',
    category: 'Media',
    description: 'Koleksi album foto kenangan dan prewedding dalam tata letak estetik.',
    icon: 'cilImage',
    defaultProps: {
      title: 'Momen Bahagia',
      subtitle: 'Galeri Foto Kenangan & Prewedding',
      layout: 'grid',
      images: [
        'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=800&q=80',
      ],
    },
  },
  LoveStory: {
    type: 'LoveStory',
    name: 'Kisah Cinta (Love Story)',
    category: 'Cerita',
    description: 'Linimasa kisah perjalanan cinta mempelai dari awal bertemu hingga pelaminan.',
    icon: 'cilHeart',
    defaultProps: {
      title: 'Kisah Kasih Kami',
      subtitle: 'Perjalanan Menuju Satu Ikatan Suci',
      stories: [
        {
          year: '2020',
          title: 'Awal Bertemu',
          text: 'Berawal dari sebuah kegiatan organisasi, tatapan pertama yang menumbuhkan rasa ketertarikan.',
        },
        {
          year: '2023',
          title: 'Menjalin Komitmen',
          text: 'Setelah melewati banyak momen berharga, kami sepakat melangkah bersama dalam niat yang tulus.',
        },
        {
          year: '2026',
          title: 'Hari Bahagia',
          text: 'Dengan restu keluarga tercinta, kami memantapkan hati untuk mengikat janji suci pernikahan.',
        },
      ],
    },
  },
  GiftRegistry: {
    type: 'GiftRegistry',
    name: 'Amplop Digital & Kado',
    category: 'Interaksi',
    description: 'Nomor rekening bank digital, e-wallet, dan alamat kirim bingkisan fisik.',
    icon: 'cilGift',
    defaultProps: {
      title: 'Tanda Kasih & Hadiah',
      note: 'Doa restu Anda merupakan karunia terindah bagi kami. Namun jika Anda ingin memberikan hadiah, kami menyediakan amplop digital berikut:',
      accounts: [
        { bank: 'BCA', number: '123-456-7890', holder: 'Rama Wijaya' },
        { bank: 'Bank Mandiri', number: '098-765-4321', holder: 'Shinta Dewi' },
      ],
      physical_gift_address:
        'Jl. Dahlia No. 12, Kebayoran Baru, Jakarta Selatan (Penerima: Shinta Dewi - 08123456789)',
    },
  },
  RsvpSection: {
    type: 'RsvpSection',
    name: 'Buku Tamu & RSVP',
    category: 'Interaksi',
    description: 'Formulir konfirmasi kehadiran tamu beserta kolom penyampaian doa restu.',
    icon: 'cilChatBubble',
    defaultProps: {
      title: 'Konfirmasi Kehadiran & Doa',
      subtitle: 'Merupakan kehormatan bagi kami atas kehadiran dan doa restu Anda',
      note: 'Mohon berkenan mengisi konfirmasi sebelum tanggal 1 Desember 2026 demi kelancaran penyambutan tamu.',
    },
  },
  RsvpForm: {
    type: 'RsvpForm',
    name: 'Buku Tamu & RSVP',
    category: 'Interaksi',
    description: 'Formulir konfirmasi kehadiran tamu beserta kolom penyampaian doa restu.',
    icon: 'cilChatBubble',
    defaultProps: {
      title: 'Konfirmasi Kehadiran & Doa',
      subtitle: 'Merupakan kehormatan bagi kami atas kehadiran dan doa restu Anda',
      note: 'Mohon berkenan mengisi konfirmasi sebelum tanggal 1 Desember 2026 demi kelancaran penyambutan tamu.',
    },
  },
  FooterSection: {
    type: 'FooterSection',
    name: 'Penutup & Salam',
    category: 'Penutup',
    description: 'Kata penutup, ucapan terima kasih dari kedua keluarga besar, dan watermark.',
    icon: 'cilBookmark',
    defaultProps: {
      closing_quote:
        'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu.',
      family_signatures: 'Keluarga Besar Bpk. Danu Wijaya & Bpk. Surya Pratama',
      brand_credit: 'Niskala Digital Invitation',
    },
  },
}

export const createNewSection = (type) => {
  const meta = COMPONENT_REGISTRY[type]
  if (!meta) return null

  return {
    id: `sec-${type.toLowerCase()}-${Date.now().toString(36)}`,
    type: type,
    is_active: true,
    props: { ...meta.defaultProps },
  }
}
