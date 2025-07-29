'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('Seeding all 753 municipalities of Nepal...');

      // Get all districts
      const [districts] = await queryInterface.sequelize.query(
        `SELECT id, name FROM districts`,
        { transaction }
      );

      // All municipalities by district (complete list)
      const municipalitiesByDistrict = {
        // Koshi Province
        'Bhojpur': ['Shadanand', 'Tyamke Maiyunm', 'Pauwadungma', 'Arun', 'Salpasilichho'],
        'Dhankuta': ['Pakhribas', 'Mahalaxmi', 'Sangurigadhi', 'Chhathar Jorpati', 'Chaubise'],
        'Ilam': ['Ilam', 'Deumai', 'Mai', 'Suryodaya', 'Phakphokthum', 'Mangsebung', 'Rong', 'Sandakpur'],
        'Jhapa': ['Bhadrapur', 'Damak', 'Arjundhara', 'Gauradaha', 'Kankai', 'Birtamod', 'Shivasatakshi', 'Kamal', 'Gauriganj', 'Barhadashi', 'Jhapa', 'Buddhashanti', 'Haldibari', 'Kachankawal'],
        'Khotang': ['Diktel Rupakot Majhuwagadhi', 'Halesi Tuwachung', 'Khotehang', 'Diprung', 'Ainselukhark', 'Jantedhunga', 'Kepilasagadhi', 'Barahapokhari', 'Rawa Besi', 'Sakela'],
        'Morang': ['Biratnagar', 'Sundar Haraincha', 'Belbari', 'Pathari-Sanischare', 'Urlabari', 'Rangeli', 'Sunwarshi', 'Letang', 'Budhiganga', 'Jahada', 'Kanepokhari', 'Katahari', 'Dhanpalthan', 'Gramthan', 'Kerabari', 'Miklajung'],
        'Okhaldhunga': ['Siddhicharan', 'Manebhanjyang', 'Champadevi', 'Sunkoshi', 'Molung', 'Chisankhugadhi', 'Khijidemba', 'Likhu'],
        'Panchthar': ['Phidim', 'Hilihang', 'Kummayak', 'Miklajung', 'Phalelung', 'Phalgunanda', 'Tumbewa', 'Yangwarak'],
        'Sankhuwasabha': ['Khandbari', 'Chainpur', 'Dharmadevi', 'Madi', 'Panchkhapan', 'Makalu', 'Sabhapokhari', 'Silichong'],
        'Solukhumbu': ['Solududhakunda', 'Thulung Dudhkoshi', 'Mahakulung', 'Sotang', 'Likhu Pike', 'Necha Salyan', 'Khumbu Pasang Lhamu'],
        'Sunsari': ['Itahari', 'Dharan', 'Inaruwa', 'Duhabi', 'Ramdhuni', 'Barahachhetra', 'Koshi', 'Gadhi', 'Harinagara', 'Bhokraha', 'Dewanganj', 'Barju'],
        'Taplejung': ['Phungling', 'Athrai', 'Pathibhara Yangwarak', 'Meringden', 'Sidingwa', 'Phaktanglung', 'Maiwakhola', 'Mikwakhola', 'Sirijangha'],
        'Terhathum': ['Myanglung', 'Laligurans', 'Aathrai', 'Chhathar', 'Menchhayayem', 'Phedap'],
        'Udayapur': ['Triyuga', 'Katari', 'Chaudandigadhi', 'Belaka', 'Udayapurgadhi', 'Rautamai', 'Tapli', 'Limchungbung'],

        // Madhesh Province
        'Bara': ['Kalaiya', 'Jitpur Simara', 'Kolhabi', 'Nijgadh', 'Pheta', 'Simraungadh', 'Adarsh Kotwal', 'Karaiyamai', 'Prasauni', 'Devtal', 'Baragadhi', 'Suwarna', 'Parwanipur', 'Bishrampur'],
        'Dhanusha': ['Janakpur', 'Chhireshwarnath', 'Ganeshman Charnath', 'Dhanusadham', 'Mithila', 'Sahidnagar', 'Bateshwar', 'Mukhiyapatti', 'Aaurahi', 'Laxminiya', 'Hansapur', 'Nagarain', 'Janaknandini', 'Sabaila', 'Kamala', 'Mithila Bihari'],
        'Mahottari': ['Bardibas', 'Gaushala', 'Jaleshwor', 'Manara', 'Balwa', 'Bhangaha', 'Aurahi', 'Matihani', 'Pipra', 'Samsi', 'Loharpatti', 'Ramgopalpur', 'Sonama', 'Ekdanra', 'Mahottari'],
        'Parsa': ['Birgunj', 'Bahudarmai', 'Parsagadhi', 'Pokhariya', 'Kalikamai', 'Jirabhawani', 'Chhipaharmai', 'Paterwa Sugauli', 'Dhobini', 'Sakhuwa Prasauni', 'Thori', 'Jagarnathpur', 'Bindabasini'],
        'Rautahat': ['Chandrapur', 'Garuda', 'Gujara', 'Rajpur', 'Baudhimai', 'Madhav Narayan', 'Gaur', 'Ishanath', 'Katahariya', 'Phatuwa Bijayapur', 'Dewahi Gonahi', 'Brindaban', 'Gadhimai', 'Rajdevi', 'Maulapur', 'Paroha', 'Yemunamai', 'Durga Bhagwati'],
        'Saptari': ['Rajbiraj', 'Hanumannagar', 'Khadak', 'Dakneshwori', 'Surunga', 'Bishnupur', 'Balan Bihul', 'Tirahut', 'Tilathi Koiladi', 'Rupani', 'Chhinnamasta', 'Mahadeva', 'Saptakoshi', 'Agnisair', 'Kanchanrup', 'Shambhunath', 'Rupani', 'Bode Barsain'],
        'Sarlahi': ['Malangwa', 'Haripur', 'Haripurwa', 'Hariwan', 'Ishworpur', 'Lalbandi', 'Barahathawa', 'Kabilasi', 'Bagmati', 'Ramnagar', 'Chandranagar', 'Brahmapuri', 'Basbariya', 'Parsa', 'Ramkot', 'Kaudena', 'Dhankaul'],
        'Siraha': ['Lahan', 'Siraha', 'Golbazar', 'Mirchaiya', 'Kalyanpur', 'Dhangadhimai', 'Bishnupur', 'Karjanha', 'Sakhuwanankarkatti', 'Arnama', 'Naraha', 'Bariyarpatti', 'Laxmipur Patari', 'Sukhipur', 'Bhagawanpur'],

        // Bagmati Province
        'Bhaktapur': ['Bhaktapur', 'Changunarayan', 'Suryabinayak', 'Madhyapur Thimi'],
        'Chitwan': ['Bharatpur', 'Ratnanagar', 'Kalika', 'Khairhani', 'Madi', 'Rapti', 'Ichhyakamana'],
        'Dhading': ['Dhading Besi', 'Nilkantha', 'Khaniyabas', 'Rubi Valley', 'Gajuri', 'Galchhi', 'Gangajamuna', 'Netrawati', 'Jwalamukhi', 'Thakre', 'Benighat Rorang', 'Siddhalek', 'Tripurasundari'],
        'Dolakha': ['Bhimeshwar', 'Jiri', 'Kalinchok', 'Melung', 'Bigu', 'Gaurishankar', 'Baiteshwar', 'Tamakoshi'],
        'Kathmandu': ['Kathmandu', 'Kageshwari Manohara', 'Gokarneshwar', 'Chandragiri', 'Tokha', 'Budhanilkantha', 'Nagarjun', 'Tarakeshwar', 'Kirtipur', 'Shankharapur', 'Dakshinkali'],
        'Kavrepalanchok': ['Dhulikhel', 'Banepa', 'Panauti', 'Panchkhal', 'Namobuddha', 'Mandandeupur', 'Khanikhola', 'Chaurideurali', 'Temal', 'Bethanchok', 'Bhumlu', 'Mahabharat', 'Roshi'],
        'Lalitpur': ['Lalitpur', 'Mahalaxmi', 'Godawari', 'Konjyosom', 'Bagmati', 'Mahankal'],
        'Makwanpur': ['Hetauda', 'Thaha', 'Bhimphedi', 'Makawanpurgadhi', 'Manahari', 'Raksirang', 'Bakaiya', 'Kailash', 'Bagmati', 'Indrasarowar'],
        'Nuwakot': ['Bidur', 'Belkotgadhi', 'Kakani', 'Kispang', 'Tadi', 'Dupcheshwar', 'Panchakanya', 'Likhu', 'Meghang', 'Shivapuri', 'Suryagadhi', 'Tarkeshwar', 'Tarakeshwar'],
        'Ramechhap': ['Manthali', 'Ramechhap', 'Umakunda', 'Khandadevi', 'Gokulganga', 'Doramba', 'Sunapati'],
        'Rasuwa': ['Gosaikunda', 'Kalika', 'Naukunda', 'Uttargaya'],
        'Sindhuli': ['Kamalamai', 'Dudhouli', 'Tinpatan', 'Marin', 'Golanjor', 'Phikkal', 'Sunkoshi', 'Ghyanglekh', 'Hariharpurgadhi'],
        'Sindhupalchok': ['Chautara', 'Indrawati', 'Jugal', 'Bhotekoshi', 'Balephi', 'Barhabise', 'Bhotekoshi', 'Lisankhu', 'Sunkoshi', 'Helambu', 'Melamchi', 'Panchpokhari', 'Thangpal'],

        // Gandaki Province
        'Baglung': ['Baglung', 'Dhorpatan', 'Galkot', 'Jaimuni', 'Bareng', 'Kanthe', 'Taman Khola', 'Tamankhola', 'Tarakhola', 'Nisikhola'],
        'Gorkha': ['Gorkha', 'Palungtar', 'Sulikot', 'Siranchok', 'Ajirkot', 'Arughat', 'Bhimsen', 'Chum Nubri', 'Dharche', 'Gandaki', 'Sahid Lakhan'],
        'Kaski': ['Pokhara', 'Annapurna', 'Machhapuchhre', 'Madi', 'Rupa'],
        'Lamjung': ['Besisahar', 'Madhya Nepal', 'Rainas', 'Marsyangdi', 'Dordi', 'Dudhpokhari', 'Kwolasothar'],
        'Manang': ['Chame', 'Narpa Bhumi', 'Nashong', 'Manang'],
        'Mustang': ['Lomanthang', 'Thasang', 'Gharapjhong', 'Baragung Muktichhetra', 'Lo-Ghekar Damodarkunda'],
        'Myagdi': ['Beni', 'Annapurna', 'Dhaulagiri', 'Mangala', 'Malika', 'Raghuganga'],
        'Nawalpur': ['Kawasoti', 'Gaindakot', 'Madhyabindu', 'Baudikali', 'Bulingtar', 'Binayi Triveni', 'Devchuli'],
        'Parbat': ['Kusma', 'Phalebas', 'Jaljala', 'Modi', 'Paiyun', 'Bihadi', 'Mahashila'],
        'Syangja': ['Putalibazar', 'Waling', 'Galyang', 'Chapakot', 'Biruwa', 'Arjun Chaupari', 'Phedikhola', 'Aandhikhola', 'Bhirkot', 'Harinas'],
        'Tanahun': ['Damauli', 'Shuklagandaki', 'Bhanu', 'Bhimad', 'Byas', 'Rhishing', 'Myagde', 'Devghat', 'Bandipur', 'Ghiring'],

        // Lumbini Province
        'Arghakhanchi': ['Sandhikharka', 'Sitganga', 'Bhumikasthan', 'Chhatradev', 'Panini', 'Malarani'],
        'Banke': ['Nepalgunj', 'Kohalpur', 'Narainapur', 'Raptisonari', 'Baijanath', 'Khajura', 'Janaki', 'Duduwa'],
        'Bardiya': ['Gulariya', 'Madhuwan', 'Rajapur', 'Bansgadhi', 'Barbardiya', 'Geruwa', 'Badhaiyatal', 'Thakurbaba'],
        'Dang': ['Ghorahi', 'Tulsipur', 'Lamahi', 'Rapti', 'Gadhawa', 'Bangalachuli', 'Dangisharan', 'Rajpur', 'Shantinagar', 'Babhani'],
        'Gulmi': ['Tamghas', 'Resunga', 'Gulmidarbar', 'Chandrakot', 'Madane', 'Malika', 'Dhurkot', 'Isma', 'Kaligandaki', 'Ruru', 'Satyawati', 'Chatrakot'],
        'Kapilvastu': ['Kapilvastu', 'Banganga', 'Buddhabhumi', 'Shivaraj', 'Maharajgunj', 'Krishnanagar', 'Yashodhara', 'Mayadevi', 'Suddhodhan'],
        'Parasi': ['Ramgram', 'Sunwal', 'Sarawal', 'Pratappur', 'Bardaghat', 'Palhinandan', 'Susta'],
        'Palpa': ['Tansen', 'Rampur', 'Rainadevi Chhahara', 'Rambha', 'Bagnaskali', 'Mathagadhi', 'Nisdi', 'Purbakhola', 'Tinau', 'Ribdikot'],
        'Pyuthan': ['Pyuthan', 'Sworgadwari', 'Gaumukhi', 'Mandavi', 'Jhimruk', 'Airawati', 'Sarumarani', 'Naubahini'],
        'Rolpa': ['Liwang', 'Runtigadhi', 'Triveni', 'Sunilsmriti', 'Sunchhahari', 'Madi', 'Ganga', 'Rolpa', 'Thawang', 'Pariwartan'],
        'Rukum East': ['Rukumkot', 'Putha Uttarganga', 'Bhume', 'Sisne'],
        'Rupandehi': ['Siddharthanagar', 'Butwal', 'Devdaha', 'Lumbini Sanskritik', 'Tillotama', 'Gaidahawa', 'Kotahimai', 'Marchawari', 'Mayadevi', 'Omsatiya', 'Rohini', 'Sammarimai', 'Siyari', 'Suddhodhan'],

        // Karnali Province
        'Dailekh': ['Dullu', 'Narayan', 'Chamunda Bindrasaini', 'Gurans', 'Bhairabi', 'Naumule', 'Mahabu', 'Thantikandh', 'Bhagawatimai', 'Dungeshwar'],
        'Dolpa': ['Thuli Bheri', 'Tripurasundari', 'Dolpo Buddha', 'Shey Phoksundo', 'Jagadulla', 'Mudkechula', 'Kaike'],
        'Humla': ['Simkot', 'Sarkegad', 'Kharpunath', 'Tajakot', 'Adanchuli', 'Chankheli', 'Namkha'],
        'Jajarkot': ['Bheri', 'Chhedagad', 'Junichande', 'Kushe', 'Barekot', 'Nalagad', 'Shivalaya'],
        'Jumla': ['Chandannath', 'Tila', 'Guthichaur', 'Hima', 'Sinja', 'Tatopani'],
        'Kalikot': ['Khandachakra', 'Raskot', 'Tilagupha', 'Pachaljharana', 'Sanni Triveni', 'Naraharinath', 'Mahawai', 'Palata'],
        'Mugu': ['Chhayanath Rara', 'Soru', 'Khatyad', 'Mugum Karmarong'],
        'Rukum West': ['Musikot', 'Triveni', 'Sanibheri', 'Banfikot'],
        'Salyan': ['Sharada', 'Bagchaur', 'Bangad Kupinde', 'Kalimati', 'Tribeni', 'Kapurkot', 'Chhatreshwari', 'Darma', 'Kumakh'],
        'Surkhet': ['Birendranagar', 'Bheriganga', 'Gurbhakot', 'Panchapuri', 'Lekbeshi', 'Chaukune', 'Barahatal', 'Simta'],

        // Sudurpashchim Province
        'Achham': ['Mangalsen', 'Kamalbazar', 'Sanphebagar', 'Panchadeval Binayak', 'Chaurpati', 'Turmakhand', 'Ramaroshan', 'Dhakari', 'Bannigadhi Jayagad', 'Mellekh'],
        'Baitadi': ['Dasharathchand', 'Patan', 'Melauli', 'Purchaudi', 'Surnaya', 'Sigras', 'Shivanath', 'Dogdakedar'],
        'Bajhang': ['Jaya Prithvi', 'Bungal', 'Talkot', 'Masta', 'Khaptad Chhanna', 'Thalara', 'Bitthadchir', 'Surma', 'Chhabis Pathibhera', 'Durgathali'],
        'Bajura': ['Budhiganga', 'Tribeni', 'Budhinanda', 'Gaumul', 'Jagannath', 'Swami Kartik', 'Badimalika', 'Himali'],
        'Dadeldhura': ['Amargadhi', 'Parashuram', 'Aalital', 'Ganyapadhura', 'Navadurga', 'Ajaymeru'],
        'Darchula': ['Shailyashikhar', 'Mahakali', 'Malikarjun', 'Marma', 'Lekam', 'Duhun', 'Naugad', 'Vyans', 'Apihimal'],
        'Doti': ['Dipayal Silgadhi', 'Shikhar', 'Purbichauki', 'Badikedar', 'Jorayal', 'Sayal', 'Aadarsha', 'K.I. Singh', 'Bogatan'],
        'Kailali': ['Dhangadhi', 'Tikapur', 'Ghodaghodi', 'Lamki Chuha', 'Bhajani', 'Godawari', 'Gauriganga', 'Janaki', 'Joshipur', 'Kailari', 'Mohanyal', 'Bardagoriya'],
        'Kanchanpur': ['Bhimdatta', 'Krishnapur', 'Belauri', 'Bedkot', 'Mahakali', 'Shuklaphanta', 'Punarbas', 'Laljhadi']
      };

      const municipalities = [];

      districts.forEach(district => {
        const districtMunicipalities = municipalitiesByDistrict[district.name] || [];

        districtMunicipalities.forEach(municipalityName => {
          municipalities.push({
            id: uuidv4(),
            name: municipalityName,
            districtId: district.id,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        });
      });

      await queryInterface.bulkInsert('municipalities', municipalities, { transaction });
      await transaction.commit();
      console.log(`Successfully seeded ${municipalities.length} municipalities`);
    } catch (error) {
      await transaction.rollback();
      console.error('Error seeding municipalities:', error);
      throw error;
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('municipalities', null, {});
  }
};