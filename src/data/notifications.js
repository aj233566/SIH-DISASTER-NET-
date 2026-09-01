export const initialNotifications = [
  {
    id: "NOTIF-001",
    channel: "push", // push | in_app | sms | email
    type: "critical",
    alertId: "ALT-NER-8901",
    title: {
      en: "CRITICAL ALERT: Landslide Risk Threshold Exceeded in Mangan",
      hi: "गंभीर चेतावनी: मंगन में भूस्खलन जोखिम सीमा पार"
    },
    message: {
      en: "AI Risk Engine detected 94% composite risk in Mangan, North Sikkim. 72h rainfall: 218mm. NH-10 blocked. Immediate evacuation advised.",
      hi: "एआई रिस्क इंजन ने मंगन, उत्तरी सिक्किम में 94% जोखिम दर्ज किया। 72 घंटे की बारिश: 218 मिमी। एनएच-10 अवरुद्ध। तुरंत सुरक्षित स्थान पर जाएं।"
    },
    targetAudience: "All Citizens & Responders in Mangan",
    smsTemplateId: "DLT-NER-NDMA-1049",
    emailSubject: "[CASCADE-NET URGENT] Evacuation Advisory - Mangan District",
    timestamp: "2026-09-01T11:45:00Z",
    read: false,
    delivered: true
  },
  {
    id: "NOTIF-002",
    channel: "in_app",
    type: "critical",
    alertId: "ALT-NER-8902",
    title: {
      en: "PRIORITY 1: Haflong Railway Sector Embankment Failure",
      hi: "प्राथमिकता 1: हाफलोंग रेलवे तटबंध धंसने का खतरा"
    },
    message: {
      en: "Lumding-Badarpur rail link suspended due to ballast shift. 3 NDRF teams deployed to Lower Haflong sector.",
      hi: "लम्बडिंग-बदरपुर रेलवे लाइन स्थगित। लोअर हाफलोंग क्षेत्र में एनडीआरएफ की 3 टीमें तैनात की गईं।"
    },
    targetAudience: "District Disaster Management Authorities & Railways",
    timestamp: "2026-09-01T10:20:00Z",
    read: false,
    delivered: true
  },
  {
    id: "NOTIF-003",
    channel: "sms",
    type: "warning",
    alertId: "ALT-NER-8903",
    title: {
      en: "SMS Advisory: Traffic Restriction on Lengpui Airport Road",
      hi: "एसएमएस सूचना: लेंगपुई एयरपोर्ट रोड पर यातायात प्रतिबंध"
    },
    message: {
      en: "CASCADE-NET ALERT: Single-lane traffic only on Lengpui road, Aizawl due to slope movement. Avoid heavy vehicles. Helpline: 1070.",
      hi: "कैस्केड-नेट चेतावनी: ढलान खिसकने के कारण लेंगपुई रोड, आइजोल पर केवल एकतरफा यातायात। भारी वाहनों से बचें। हेल्पलाइन: 1070."
    },
    targetAudience: "Mobile Subscribers in Aizawl Circle (BSNL/Airtel/Jio)",
    smsTemplateId: "DLT-NER-TRAI-8821",
    timestamp: "2026-09-01T09:35:00Z",
    read: true,
    delivered: true
  },
  {
    id: "NOTIF-004",
    channel: "email",
    type: "warning",
    alertId: "ALT-NER-8904",
    title: {
      en: "Disaster Advisory: Kohima Pagala Pahar Rockfall Monitoring",
      hi: "आपदा परामर्श: कोहिमा पगला पहाड़ रॉकफॉल निगरानी"
    },
    message: {
      en: "PWD & BRO quick clearing teams deployed on NH-29 bypass. Speed restrictions enforced for all commercial transports.",
      hi: "एनएच-29 बाईपास पर त्वरित मलबा हटाने वाले दल तैनात। सभी वाणिज्यिक वाहनों की गति सीमा सीमित।"
    },
    targetAudience: "Transport Commissioner & Nagaland Police Control Room",
    emailSubject: "[CASCADE-NET ADVISORY] NH-29 Slope Monitoring Brief",
    timestamp: "2026-09-01T08:50:00Z",
    read: true,
    delivered: true
  },
  {
    id: "NOTIF-005",
    channel: "in_app",
    type: "info",
    alertId: "ALT-NER-8905",
    title: {
      en: "System Health: All 48 Geotechnical Telemetry Nodes Online",
      hi: "सिस्टम स्वास्थ्य: सभी 48 भू-तकनीकी टेलीमेट्री नोड्स ऑनलाइन"
    },
    message: {
      en: "Satellite uplink active across all North Eastern stations. Next synchronized telemetry sync in 15 minutes.",
      hi: "सभी पूर्वोत्तर स्टेशनों पर सैटेलाइट अपलिंक सक्रिय है। अगला डेटा सिंक 15 मिनट में होगा।"
    },
    targetAudience: "System Administrators & Engineering Cell",
    timestamp: "2026-09-01T07:30:00Z",
    read: true,
    delivered: true
  }
];
