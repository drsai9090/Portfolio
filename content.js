export const profile = {
  name: 'Sai Sugun D R',
  title: 'Full-stack Software Engineer',
  intro: 'I build web applications in JavaScript and Python, including document-search tools and data workflows.',
  story: [
    'I studied Computer Science and Engineering at S J C Institute of Technology, then completed an MSc in Information Systems at University College Dublin.',
    'My recent work includes Sugun Games, a browser arcade with shared-code racing, a reconciliation workbench, and a synthetic evidence demo for Your Senior. I also worked on Mindful-U as part of a five-person design team at UCD.'
  ],
  github: 'https://github.com/Saisugun9090',
  linkedin: 'https://linkedin.com/in/sai-sugun-d-r',
  email: 'saisugun15@gmail.com',
  education: [
    { title: 'MSc Information Systems', place: 'University College Dublin', year: '2024–2025 · Second Class Honours, Grade 1' },
    { title: 'B.E. Computer Science and Engineering', place: 'S J C Institute of Technology · VTU', year: '2019–2023 · First Class with Distinction' }
  ],
  experience: [
    { title: 'Software Developer', place: 'PayPathIQ Limited', period: 'August 2026 · Five-week placement', description: 'Worked on law-firm case management and property-management applications with the PayPathIQ team.' },
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
    id: 'sugun-games',
    title: 'Sugun Games',
    category: 'Browser games & multiplayer',
    districts: ['frontend', 'delivery'],
    summary: 'Four browser games, including toy-brick car building and shared-code racing for 2–4 players.',
    status: 'Live on Vercel',
    stack: ['JavaScript', 'Canvas', 'PeerJS / WebRTC', 'Node.js tests', 'GitHub Actions', 'Vercel'],
    repo: 'https://github.com/Saisugun9090/sugun-games',
    live: 'https://sugungames.vercel.app/',
    liveLabel: 'Play games',
    role: 'I developed and published the game collection, including the game rules, controls, room-code flow and automated checks.',
    problem: 'Friends need a quick way to choose and play a game together without installing software or creating accounts.',
    overview: 'A static arcade with Brick Garage, Formula Club, Echo Shift and Pocket Snake. Formula Club supports solo practice and shared-code races for 2–4 drivers.',
    approach: 'Each game has its own page and independently testable engine. Canvas draws the games; keyboard and on-screen controls handle input. Formula Club uses PeerJS connections: guests send controls, while the host simulates the race and broadcasts its state.',
    decisions: [
      'Keep the arcade as static HTML, CSS and JavaScript with no application server or build step.',
      'Validate multiplayer inputs and require ordered checkpoints before counting a lap.',
      'Pause solo games when hidden and explain what happens when a race host leaves.'
    ],
    outcome: 'Four published games, 23 passing rule and protocol tests, and a verified two-browser room connection on the live site.',
    limitations: 'Shared races depend on public PeerJS infrastructure and the players’ networks. The host must keep the tab visible; leaving ends the room. Cars pass through each other, and there is no ranked matchmaking.',
    next: 'Test rooms across more devices and networks, then tune steering and course difficulty from player feedback.',
    flow: ['Choose game', 'Keyboard or touch', 'Game engine', 'Canvas frame', 'Create or join race', 'Host state sync']
  },
  {
    id: 'inception-workbench',
    title: 'Reconciliation Workbench',
    category: 'Data workflows & backend engineering',
    districts: ['frontend', 'backend', 'data', 'delivery'],
    summary: 'Import synthetic invoices and payments, review exceptions, and approve matches with a traceable audit history.',
    status: 'Local synthetic-data prototype',
    stack: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker', 'GitHub Actions'],
    repo: 'https://github.com/Saisugun9090/inception-workbench',
    role: 'I built the import, reconciliation and review flow, with source preservation, transaction checks and a React workbench.',
    problem: 'Duplicate deliveries, conflicting source rows and ambiguous payments make manual reconciliation difficult to trace.',
    overview: 'A workbench that validates CSV records, suggests exact-reference and equal-amount matches, and requires a reviewer to approve each pair.',
    approach: 'The Node.js API preserves original CSV text alongside parsed and validated records. Amounts are stored as integer cents. PostgreSQL transactions commit imports or approvals together with their audit events, and repeated requests return the saved result.',
    decisions: [
      'Preserve source conflicts and rejected rows for review instead of overwriting canonical records.',
      'Use exact integer arithmetic for EUR amounts and database constraints to prevent double allocation.',
      'Require review notes for ambiguous matches and test retries, concurrent approvals and transaction rollback against PostgreSQL.'
    ],
    outcome: 'A working local prototype with passing type checks, unit and PostgreSQL integration tests, frontend build and container smoke checks in CI.',
    limitations: 'Synthetic data only: no banking connections or money movement. Supports EUR, fixed CSV columns and whole invoice/payment pairs. Shared role keys do not identify individual reviewers. No public deployment.',
    next: 'Add individual reviewer identity and a controlled reversal workflow before extending the allocation rules.',
    flow: ['Invoice + payment CSV', 'Validate + preserve source', 'Suggest matches', 'Review exceptions', 'Approve in transaction', 'Audit history']
  },
  {
    id: 'your-senior',
    title: 'Your Senior · Evidence Demo',
    category: 'Document retrieval prototype',
    districts: ['frontend', 'backend', 'data', 'delivery'],
    summary: 'A synthetic document assistant with source excerpts, validated citation IDs and explicit unsupported answers.',
    status: 'Local prototype · prewritten demo answers',
    stack: ['Python', 'FastAPI', 'React', 'ChromaDB', 'Pydantic', 'GitHub Actions'],
    repo: 'https://github.com/Saisugun9090/interstellar-your-senior',
    role: 'I extended Your Senior with a reproducible synthetic demo, stricter response validation, source inspection and guarded ingestion.',
    problem: 'Searching several documents for an answer is slow, and an answer without a source is hard to check.',
    overview: 'A React and FastAPI prototype that retrieves passages from three fictional documents and demonstrates supported, partial and unsupported responses using labelled prewritten answers.',
    approach: 'The demo indexes fixed document chunks in an in-memory Chroma collection using deterministic word vectors. A prewritten response provider returns structured answers. Pydantic validates their shape and checks citation IDs against retrieved passages; the UI shows the exact excerpts and full source documents.',
    decisions: [
      'Keep the demo reproducible with synthetic documents, labelled fixtures and no paid model dependency.',
      'Reject invalid provider output and unknown citation IDs; return unsupported answers without fallback sources.',
      'Disable ingestion and admin endpoints in demo mode and keep operator keys out of the frontend.'
    ],
    outcome: 'A source-available evidence demo with 19 backend tests, a frontend request test and a passing production build in CI.',
    limitations: 'The demo uses prewritten answers, not live AI. Citation-ID validation does not prove factual support. Live-provider quality, per-user identity and atomic index replacement remain unverified. No public deployment.',
    next: 'Evaluate a live provider on held-out synthetic questions and verify answer support, storage recovery and per-user access.',
    flow: ['Synthetic documents', 'Fixed chunks', 'Chroma retrieval', 'Prewritten response', 'Validate citations', 'Inspect sources']
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
