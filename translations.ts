
import { Language } from './types';

export const translations = {
  GE: {
    nav: { 
      home: 'მთავარი', 
      jobs: 'ვაკანსიები', 
      workers: 'შემსრულებლები',
      dashboard: 'კაბინეტი', 
      messages: 'მესიჯები',
      myPosts: 'ჩემი პოსტები',
      admin: 'მართვა' 
    },
    onboarding: {
      title: 'მოგესალმებით DAYPAY-ზე',
      subtitle: 'აირჩიეთ თქვენი როლი პლატფორმაზე. როლის შეცვლა ნებისმიერ დროს შეგიძლიათ პარამეტრებიდან.',
      workerTitle: 'მინდა მუშაობა',
      workerDesc: 'მოძებნეთ ყოველდღიური საქმე, მიიღეთ ანაზღაურება მყისიერად და აიმაღლეთ რეიტინგი.',
      posterTitle: 'მინდა დაქირავება',
      posterDesc: 'განათავსეთ დავალება 1 წუთში, შეარჩიეთ საუკეთესო კანდიდატი და მიიღეთ ხარისხიანი სერვისი.',
      start: 'დაწყება',
      email: 'ელ-ფოსტა',
      password: 'პაროლი'
    },
    chat: {
      placeholder: 'დაწერეთ შეტყობინება...',
      send: 'გაგზავნა',
      safetyBanner: 'DAYPAY დაცვა ჩართულია. არ გადაიხადოთ პლატფორმის გარეთ.',
      statusClosed: 'ჩატი დახურულია, რადგან დავალება დასრულებულია.',
      activeTitle: 'ჩატი',
      unread: 'წაუკითხავი'
    },
    hero: {
      tag: 'შექმნილია საქართველოს ეკონომიკისთვის',
      title: 'ყოველდღიური საქმე,',
      titleHighlight: 'მყისიერი შემოსავალი.',
      subtitle: 'მარტივი გზა სამუშაოს განთავსებისა და შესრულებისთვის თანამედროვე ონლაინ პლატფორმაზე.',
      btnFind: 'მოძებნე სამუშაო დღესვე',
      btnPost: 'დადე დავალება (₾0 საკომისიო)'
    },
    categories: {
      title: 'პოპულარული კატეგორიები',
      subtitle: 'დაათვალიერეთ ვაკანსიები სფეროების მიხედვით',
      viewAll: 'ყველას ნახვა',
      active: 'აქტიური'
    },
    featured: {
      title: 'რეკომენდირებული ვაკანსიები',
      subtitle: 'საუკეთესო შემოთავაზებები თქვენს მხარეში',
      all: 'ყველა',
      nearby: 'ჩემთან ახლოს'
    },
    stats: {
      jobs: 'ვაკანსია',
      users: 'მომხმარებელი',
      safety: 'დაცული',
      paid: 'გადახდილი'
    },
    dashboard: {
      welcome: 'მოგესალმებით',
      ready: 'მზად ხართ სამუშაოდ?',
      readyPoster: 'დღეს ვის ქირაობთ?',
      earnings: 'ჯამური მოგება',
      spent: 'დახარჯული თანხა',
      completed: 'შესრულებული',
      activePosts: 'აქტიური პოსტები',
      rating: 'რეიტინგი',
      hours: 'ნამუშევარი საათები',
      hires: 'დაქირავებული',
      trend: 'შემოსავლის ტენდენცია',
      trendPoster: 'ხარჯვის ტენდენცია',
      thisWeek: 'ამ კვირაში',
      activeTasks: 'აქტიური დავალებები',
      history: 'ისტორიის ნახვა',
      aiRecs: 'AI რეკომენდაციები',
      aiRecsPoster: 'თქვენთვის შესაფერისი შემსრულებლები',
      aiPersonal: 'პერსონალიზირებული',
      aiLoading: 'ვამზადებთ ახალ რეკომენდაციებს...'
    },
    jobCard: { 
      urgent: 'სასწრაფო', 
      apply: 'მიმართე ახლავე', 
      verified: 'ვერიფიცირებული დამკვეთი', 
      aiRecommended: 'AI რეკომენდირებული' 
    },
    filters: { 
      location: 'მდებარეობა', 
      budget: 'ბიუჯეტი', 
      categories: 'კატეგორიები', 
      search: 'ძებნა...', 
      apply: 'ფილტრაცია', 
      min: 'მინ', 
      max: 'მაქს' 
    },
    modal: { 
      guaranteed: 'გარანტირებული გადახდა', 
      date: 'თარიღი', 
      time: 'დრო', 
      loc: 'მდებარეობა', 
      map: 'რუკაზე ნახვა',
      openInMaps: 'გახსენი ნავიგაციაში',
      selectLoc: 'მონიშნე ზუსტი მისამართი',
      duration: 'ხანგრძლივობა', 
      desc: 'აღწერა', 
      chat: 'ჩატი', 
      submit: 'დადასტურება და გაგზავნა', 
      success: 'განაცხადი მიღებულია', 
      cancel: 'გაუქმება' 
    },
    footer: { 
      desc: 'საქართველოს ყოველდღიური სამუშაო ძალის გაძლიერება. მოძებნეთ ვერიფიცირებული საქმე, დაიქირავეთ სანდო ხალხი.', 
      platform: 'პლატფორმა', 
      support: 'მხარდაჭერა', 
      builtWith: 'შექმნილია საქართველოში ❤️-ით' 
    }
  },
  EN: {
    nav: { 
      home: 'Home', 
      jobs: 'Jobs', 
      workers: 'Find Workers', 
      dashboard: 'Cabinet', 
      messages: 'Messages',
      myPosts: 'My Posts', 
      admin: 'Admin' 
    },
    onboarding: {
      title: 'Welcome to DAYPAY',
      subtitle: 'Choose your role on the platform. You can switch roles anytime from settings.',
      workerTitle: 'I want to Work',
      workerDesc: 'Find daily tasks, get paid instantly, and build your professional rating.',
      posterTitle: 'I want to Hire',
      posterDesc: 'Post a task in 1 minute, select best candidates, and get quality service.',
      start: 'Get Started',
      email: 'Email',
      password: 'Password'
    },
    chat: {
      placeholder: 'Type a message...',
      send: 'Send',
      safetyBanner: 'DAYPAY Shield is active. Never pay outside the platform.',
      statusClosed: 'Chat is closed as the task is finished.',
      activeTitle: 'Chat',
      unread: 'Unread'
    },
    hero: {
      tag: 'Built for Georgia\'s Economy',
      title: 'Daily Tasks,',
      titleHighlight: 'Daily Earnings.',
      subtitle: 'Simple way to post and complete work on a modern online platform.',
      btnFind: 'Find Work Today',
      btnPost: 'Post a Task (₾0 Fee)'
    },
    categories: {
      title: 'Popular Categories',
      subtitle: 'Explore jobs by industry',
      viewAll: 'View All',
      active: 'Active'
    },
    featured: {
      title: 'Featured Jobs',
      subtitle: 'Top opportunities in your area',
      all: 'All',
      nearby: 'Nearby'
    },
    stats: {
      jobs: 'Jobs Posted',
      users: 'Active Users',
      safety: 'Safe & Secure',
      paid: 'Total Paid'
    },
    dashboard: {
      welcome: 'Welcome',
      ready: 'Ready to work?',
      readyPoster: 'Who are you hiring today?',
      earnings: 'Total Earnings',
      spent: 'Total Spent',
      completed: 'Completed',
      activePosts: 'Active Posts',
      rating: 'Rating',
      hours: 'Work Hours',
      hires: 'Total Hires',
      trend: 'Earnings Trend',
      trendPoster: 'Spending Trend',
      thisWeek: 'This Week',
      activeTasks: 'Active Tasks',
      history: 'View History',
      aiRecs: 'AI Recommendations',
      aiRecsPoster: 'Recommended Workers',
      aiPersonal: 'Personalized',
      aiLoading: 'Preparing recommendations...'
    },
    jobCard: { 
      urgent: 'Urgent', 
      apply: 'Apply Now', 
      verified: 'Verified Poster', 
      aiRecommended: 'AI Recommended' 
    },
    filters: { 
      location: 'Location', 
      budget: 'Budget', 
      categories: 'Categories', 
      search: 'Search...', 
      apply: 'Filter', 
      min: 'Min', 
      max: 'Max' 
    },
    modal: { 
      guaranteed: 'Guaranteed Payment', 
      date: 'Date', 
      time: 'Time', 
      loc: 'Location', 
      map: 'View on Map',
      openInMaps: 'Open in Navigation',
      selectLoc: 'Mark exact address',
      duration: 'Duration', 
      desc: 'Description', 
      chat: 'Chat', 
      submit: 'Confirm & Send', 
      success: 'Application Sent', 
      cancel: 'Cancel' 
    },
    footer: { 
      desc: 'Empowering Georgia\'s daily workforce. Find verified work, hire reliable people.', 
      platform: 'Platform', 
      support: 'Support', 
      builtWith: 'Built in Georgia with ❤️' 
    }
  }
};

export const getTranslation = (lang: Language) => translations[lang];