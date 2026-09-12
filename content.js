export const profile = {
  name: 'Sai Sugun D R',
  title: 'Full-stack Software Engineer',
  intro: 'I build web applications in JavaScript and Python, including document-search tools and data workflows.',
  story: [
    'I studied Computer Science and Engineering at S J C Institute of Technology, then completed an MSc in Information Systems at University College Dublin.',
    'My public projects include Your Senior, a document-search app, and a Python tool for configuring Ubuntu. I also worked on Mindful-U as part of a five-person design team at UCD.'
  ],
  github: 'https://github.com/Saisugun9090',
  linkedin: 'https://linkedin.com/in/sai-sugun-d-r',
  email: 'saisugun15@gmail.com',
  education: [
    { title: 'MSc Information Systems', place: 'University College Dublin', year: '2024–2025 · Second Class Honours, Grade 1' },
    { title: 'B.E. Computer Science and Engineering', place: 'S J C Institute of Technology · VTU', year: '2019–2023 · First Class with Distinction' }
  ],
  experience: [
    { title: 'Software Developer', place: 'PayPathIQ Limited', period: 'August 2026–present', description: 'Software development with the PayPathIQ team.' },
    { title: 'Freelance Software and Data Engineer', place: '24 Skanda Solutions Ltd.', period: 'January–October 2024', description: 'Python, SQL, data validation and application automation.' },
    { title: 'Data Science Intern', place: 'Oasis Infobyte', period: '2023 · One-month internship', description: 'Data-science exercises and notebook projects.' }
  ]
};

export const districts = [
  {
    id: 'frontend', name: 'Frontend', eyebrow: '01 / Interfaces',
    description: 'React chat and admin interfaces, with UX wireframes for web and mobile.',
    skills: ['JavaScript', 'React', 'HTML & CSS', 'Interface design', 'Wireframing'],
    projectIds: ['your-senior', 'mindful-u']
  },
  {
    id: 'backend', name: 'Backend', eyebrow: '02 / APIs',
    description: 'Python APIs and command-line tools with input validation.',
    skills: ['Python', 'FastAPI', 'Node.js', 'Pydantic', 'JSON APIs'],
    projectIds: ['your-senior', 'ubuntu-tool']
  },
  {
    id: 'data', name: 'Data', eyebrow: '03 / Data',
    description: 'Document retrieval with ChromaDB and text classification with pandas and scikit-learn.',
    skills: ['SQL', 'ChromaDB', 'pandas', 'scikit-learn', 'Local embeddings'],
    projectIds: ['your-senior', 'emotion-classifier']
  },
  {
    id: 'delivery', name: 'Delivery', eyebrow: '04 / Delivery',
    description: 'Docker packaging, Ubuntu configuration and automated tests in GitHub Actions.',
    skills: ['Git & GitHub', 'Docker', 'GitHub Actions', 'pytest', 'Ubuntu / Linux'],
    projectIds: ['ubuntu-tool', 'your-senior']
  }
];

export const projects = [
  {
    id: 'your-senior',
    title: 'Your Senior',
    category: 'AI application',
    districts: ['frontend', 'backend', 'data', 'delivery'],
    summary: 'A document-search app that answers questions with source excerpts.',
    status: 'Source-available application',
    stack: ['React', 'FastAPI', 'Python', 'Claude', 'ChromaDB', 'Docker'],
    repo: 'https://github.com/Saisugun9090/YOUR-SENIOR-',
    role: 'I started and developed the app, with later contributions from other developers.',
    problem: 'Searching several documents for an answer is slow, and an answer without a source is hard to check.',
    overview: 'A React and FastAPI app that retrieves document passages from ChromaDB and sends them to Claude with the question.',
    approach: 'The React app sends questions to a FastAPI backend, which retrieves document chunks from ChromaDB and passes them to Claude. Documents are parsed and embedded locally. The chat shows source excerpts; admin screens show indexed documents, ingestion progress and system health.',
    decisions: [
      'Create sentence-transformer embeddings locally to avoid a separate embedding API.',
      'Show source passages in expandable answer cards.',
      'Validate API requests with input limits and package the services with Docker Compose.'
    ],
    outcome: 'Source code for document search, with Docker setup and contributions from other developers.',
    limitations: 'The confidence label is a heuristic, and authentication is still a prototype. Retrieval accuracy needs a labelled evaluation set.',
    next: 'Add retrieval tests and per-user access control, using a labelled dataset to evaluate answers.',
    flow: ['Documents', 'Parse & chunk', 'Local embeddings', 'ChromaDB retrieval', 'Claude + sources', 'React interface']
  },
  {
    id: 'ubuntu-tool',
    title: 'Ubuntu Configuration Tool',
    category: 'Developer tooling',
    districts: ['backend', 'delivery'],
    summary: 'A Python tool for configuring Ubuntu and checking the resulting system state.',
    status: 'Personal CLI project',
    stack: ['Python', 'YAML', 'argparse', 'pytest', 'GitHub Actions', 'Ubuntu'],
    repo: 'https://github.com/Saisugun9090/ubuntu-image-tool',
    role: 'I built the CLI, validators and JSON reporting, along with the automated tests.',
    problem: 'Manual Ubuntu setup can leave packages or system settings inconsistent.',
    overview: 'A Python CLI that reads YAML to configure packages, hostname and timezone, then checks the system and writes a JSON report.',
    approach: 'The CLI reads YAML and command-line options to configure packages, hostname and timezone. Validators check the system state, and a reporter writes JSON. Tests mock subprocess calls so they run without changing the host.',
    decisions: [
      'Check system state after applying configuration.',
      'Use argument arrays and timeouts for selected subprocess commands.',
      'Mock system calls in pytest and run the tests through GitHub Actions.'
    ],
    outcome: 'A public CLI with automated tests in GitHub Actions.',
    limitations: 'The tool configures an existing host and does not create bootable images. Dry-run checks the current state, and the combined report covers package validation only.',
    next: 'Include every setting in the combined report and validate configuration before applying it.',
    flow: ['YAML + CLI', 'Configurator', 'Ubuntu utilities', 'State validation', 'JSON report']
  },
  {
    id: 'mindful-u',
    title: 'Mindful-U',
    category: 'Interface & experience design',
    districts: ['frontend'],
    summary: 'A student wellbeing interface prototype for focus, relaxation, sleep and meditation.',
    status: 'Academic team design prototype',
    stack: ['User-centred design', 'Wireframe.cc', 'Team prototyping', 'User journeys'],
    repo: 'https://github.com/Saisugun9090/Mindful-U',
    role: 'I made the initial low-fidelity wireframes in Wireframe.cc and helped develop the higher-fidelity prototype in a five-person UCD team.',
    problem: 'The design explored how students could choose an activity without navigating a complicated app.',
    overview: 'Web and mobile wireframes developed into a team prototype with activity choices and audio controls.',
    approach: 'Our team used a literature review, a class survey, an interview, personas and user scenarios to plan the screens. We developed web and mobile wireframes, then a higher-fidelity prototype with onboarding, activity choices, question cards, audio controls and profile editing.',
    decisions: [
      'Put the activity choice near the start of the experience.',
      'Use familiar audio controls for playback preferences.',
      'Discuss navigation using low-fidelity wireframes before refining the visuals.'
    ],
    outcome: 'A team prototype and wireframes, with documentation of the research and design decisions.',
    limitations: 'Personalised recommendations are a design proposal. The project is not a deployed or clinically tested wellbeing service.',
    next: 'Test the core screens with keyboard and screen-reader users before adding personalisation.',
    flow: ['Student needs', 'Scenarios', 'Low-fidelity wireframes', 'Team prototype', 'Design review']
  },
  {
    id: 'emotion-classifier',
    title: 'Text Emotion Classifier',
    category: 'Machine-learning study',
    districts: ['data'],
    summary: 'A Python study of emotion labels in text, using a Naive Bayes classifier.',
    status: 'Personal notebook study',
    stack: ['Python', 'pandas', 'scikit-learn', 'CountVectorizer', 'Naive Bayes'],
    repo: 'https://github.com/Saisugun9090/Emotion-Detection-in-Text-An-Experiment-with-Twitter-Data',
    role: 'I built a notebook to learn text preparation, classification and model evaluation.',
    problem: 'An overall accuracy score can hide poor results for individual labels.',
    overview: 'A pandas and scikit-learn notebook with count-based text features, a Naive Bayes classifier and per-class evaluation.',
    approach: 'The notebook prepares text with pandas and uses an 80/20 train-test split. CountVectorizer learns the vocabulary from the training data, and Multinomial Naive Bayes predicts six emotion labels. The notebook includes per-class reports and a text-input prediction example.',
    decisions: [
      'Fit the vocabulary on training data only.',
      'Use Naive Bayes as a simple classification baseline.',
      'Check recall for each class; the saved results show low recall for surprise.'
    ],
    outcome: 'A public notebook with saved classification reports and a prediction example.',
    limitations: 'The reported scores come from saved notebook output and need a fresh run. Text labels cannot determine a person’s emotional state or serve as a mental-health assessment.',
    next: 'Document the dataset source, rerun the notebook in a clean environment and compare another baseline.',
    flow: ['Labelled text', 'Train-test split', 'Count features', 'Naive Bayes', 'Per-class evaluation']
  }
];
