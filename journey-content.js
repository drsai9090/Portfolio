import { profile, projects } from './content.js';

export { profile, projects };

export const tourStages = ['frontend', 'backend', 'data', 'build', 'test', 'deploy'];
export const tourIntro = 'A tour of the code and delivery setup behind my projects.';

export const stages = [
  {
    id: 'frontend',
    title: 'Frontend',
    eyebrow: '01 / Frontend',
    shortDescription: 'React interfaces and UX prototypes.',
    description: 'My frontend work includes Your Senior’s React chat and admin screens, and the Mindful-U wireframes.',
    color: '#27bcff',
    skills: ['JavaScript', 'React', 'HTML & CSS', 'UI/UX', 'Wireframing'],
    projectIds: ['your-senior', 'mindful-u'],
    steps: [
      { label: 'Wireframes', body: 'I made Mindful-U’s first wireframes before our team developed the higher-fidelity design.' },
      { label: 'Branches', body: 'A branch keeps a change separate until it is ready to merge.' },
      { label: 'Interface states', body: 'Your Senior shows loading states, errors and source passages in the chat interface.' }
    ]
  },
  {
    id: 'backend',
    title: 'Backend',
    eyebrow: '02 / Backend',
    shortDescription: 'Python APIs and input validation.',
    description: 'Your Senior’s FastAPI backend handles document retrieval and requests to Claude.',
    color: '#22eab0',
    skills: ['Python', 'FastAPI', 'Pydantic', 'JSON APIs', 'Validation'],
    projectIds: ['your-senior', 'ubuntu-tool'],
    steps: [
      { label: 'Request validation', body: 'FastAPI and Pydantic define expected input and enforce request limits.' },
      { label: 'Retrieval', body: 'The backend retrieves document passages to include in the prompt sent to Claude.' },
      { label: 'Response', body: 'The response includes source excerpts and a heuristic confidence label.' }
    ]
  },
  {
    id: 'data',
    title: 'Database & retrieval',
    eyebrow: '03 / Data',
    shortDescription: 'Document indexing and text features.',
    description: 'Your Senior uses ChromaDB for document retrieval. My text-classification notebook uses pandas and scikit-learn.',
    color: '#35e6bb',
    skills: ['SQL', 'ChromaDB', 'Local embeddings', 'pandas', 'scikit-learn'],
    projectIds: ['your-senior', 'emotion-classifier'],
    steps: [
      { label: 'Document processing', body: 'Documents are parsed into text chunks before indexing.' },
      { label: 'Embeddings', body: 'Sentence-transformer embeddings are generated locally and stored in ChromaDB.' },
      { label: 'Evaluation', body: 'The emotion-classification notebook reports results for each label.' }
    ]
  },
  {
    id: 'build',
    title: 'Build',
    eyebrow: '04 / Build',
    shortDescription: 'Vite builds and Docker packaging.',
    description: 'Your Senior uses Vite for the React frontend and Docker Compose to package the application.',
    color: '#559dff',
    skills: ['Git', 'GitHub', 'Vite', 'Docker', 'Docker Compose'],
    projectIds: ['your-senior'],
    steps: [
      { label: 'Git merges', body: 'The repository includes my original work and later merged community contributions.' },
      { label: 'Frontend build', body: 'Vite builds the frontend, which Nginx serves from a container.' },
      { label: 'Containers', body: 'Docker configuration packages the frontend and Python backend as separate services.' }
    ]
  },
  {
    id: 'test',
    title: 'Test',
    eyebrow: '05 / Testing',
    shortDescription: 'Python tests in GitHub Actions.',
    description: 'Ubuntu Configuration Tool tests mock system commands and run with pytest in GitHub Actions.',
    color: '#24e5ed',
    skills: ['pytest', 'unittest.mock', 'GitHub Actions', 'Failure-path testing'],
    projectIds: ['ubuntu-tool'],
    steps: [
      { label: 'Mock system calls', body: 'Tests replace subprocess calls with mocks so they can run without changing the host.' },
      { label: 'Test failures', body: 'Tests cover configuration, validation and JSON reporting, including failure cases.' },
      { label: 'Run in CI', body: 'GitHub Actions runs the Ubuntu tool’s Python tests.' }
    ]
  },
  {
    id: 'deploy',
    title: 'Deploy',
    eyebrow: '06 / Deployment setup',
    shortDescription: 'Compose services and persistent storage.',
    description: 'Your Senior’s Docker Compose setup defines frontend and backend services, health checks and a persistent document index.',
    color: '#418dff',
    skills: ['Docker Compose', 'Nginx', 'Persistent volumes', 'Health checks'],
    projectIds: ['your-senior'],
    steps: [
      { label: 'Services', body: 'Nginx serves the frontend alongside the Python backend.' },
      { label: 'Storage', body: 'A named Docker volume keeps the Chroma index when a container is replaced.' },
      { label: 'Health checks', body: 'Health checks are defined in the Compose configuration.' }
    ]
  }
];
