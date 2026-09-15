import { profile, projects } from './content.js?v=projects-20260915';

export { profile, projects };

export const tourStages = ['frontend', 'backend', 'data', 'build', 'test', 'deploy'];
export const tourIntro = 'A tour of the code and delivery setup behind my projects.';

export const stages = [
  {
    id: 'frontend',
    title: 'Frontend',
    eyebrow: '01 / Frontend',
    shortDescription: 'React workbenches and Canvas games.',
    description: 'My frontend work includes a reconciliation workbench, source inspection in Your Senior, and keyboard and touch controls for Sugun Games.',
    color: '#27bcff',
    skills: ['JavaScript', 'TypeScript', 'React', 'Canvas', 'HTML & CSS', 'UI/UX'],
    projectIds: ['sugun-games', 'inception-workbench', 'your-senior', 'mindful-u'],
    steps: [
      { label: 'Wireframes', body: 'I made Mindful-U’s first wireframes before our team developed the higher-fidelity design.' },
      { label: 'Controls', body: 'Sugun Games supports keyboard and on-screen controls, with visible pause, restart and room-connection states.' },
      { label: 'Interface states', body: 'Your Senior shows supported, partial and unsupported answers; the workbench separates accepted, rejected and conflicting source rows.' }
    ]
  },
  {
    id: 'backend',
    title: 'Backend',
    eyebrow: '02 / Backend',
    shortDescription: 'Python and Node.js APIs with validation.',
    description: 'Your Senior validates queries and response citations. The reconciliation API validates imports and commits review decisions with their audit events.',
    color: '#22eab0',
    skills: ['Python', 'FastAPI', 'TypeScript', 'Node.js', 'Pydantic', 'JSON APIs'],
    projectIds: ['inception-workbench', 'your-senior', 'ubuntu-tool'],
    steps: [
      { label: 'Request validation', body: 'Both APIs validate inputs at their boundary. The workbench also checks role permissions before imports and approvals.' },
      { label: 'Retries', body: 'Repeating the same import key and content returns the committed result without duplicating entries.' },
      { label: 'Response', body: 'Your Senior rejects malformed responses and unknown citation IDs instead of displaying unchecked provider text.' }
    ]
  },
  {
    id: 'data',
    title: 'Database & retrieval',
    eyebrow: '03 / Data',
    shortDescription: 'PostgreSQL records and document retrieval.',
    description: 'The workbench keeps original source rows and exact monetary values in PostgreSQL. Your Senior demonstrates retrieval from a synthetic ChromaDB collection.',
    color: '#35e6bb',
    skills: ['PostgreSQL', 'SQL', 'Transactions', 'ChromaDB', 'pandas', 'scikit-learn'],
    projectIds: ['inception-workbench', 'your-senior', 'emotion-classifier'],
    steps: [
      { label: 'Preserve source', body: 'CSV imports retain original text, normalised fields and validation results so reviewers can trace a decision.' },
      { label: 'Transactions', body: 'Approvals and audit events commit together. Unique constraints prevent an invoice or payment being allocated twice.' },
      { label: 'Retrieval', body: 'Your Senior’s offline demo uses deterministic word vectors and actual Chroma retrieval; its authored scenarios are regression checks, not AI accuracy scores.' }
    ]
  },
  {
    id: 'build',
    title: 'Build',
    eyebrow: '04 / Build',
    shortDescription: 'Frontend builds and Docker packaging.',
    description: 'The workbench uses esbuild; Your Senior uses Vite. Both include container configuration. Sugun Games ships as static files with no build step.',
    color: '#559dff',
    skills: ['Git', 'GitHub', 'esbuild', 'Vite', 'Docker', 'Docker Compose'],
    projectIds: ['inception-workbench', 'your-senior', 'sugun-games'],
    steps: [
      { label: 'Git changes', body: 'Project changes are developed on branches, reviewed and checked before publication.' },
      { label: 'Frontend build', body: 'esbuild packages the React workbench; Vite builds the evidence demo. The arcade uses native JavaScript modules.' },
      { label: 'Containers', body: 'The workbench CI builds its container and checks database readiness and access boundaries.' }
    ]
  },
  {
    id: 'test',
    title: 'Test',
    eyebrow: '05 / Testing',
    shortDescription: 'Game rules, API boundaries and database retries.',
    description: 'Tests cover arcade rules and multiplayer messages, evidence-response validation, and reconciliation transactions against PostgreSQL.',
    color: '#24e5ed',
    skills: ['Node.js tests', 'Python unittest', 'pytest', 'PostgreSQL integration tests', 'GitHub Actions'],
    projectIds: ['sugun-games', 'inception-workbench', 'your-senior', 'ubuntu-tool'],
    steps: [
      { label: 'Rules', body: 'Sugun Games checks puzzle solutions, Snake collisions, driving courses, lap gates and the room protocol.' },
      { label: 'Failures', body: 'Workbench integration tests exercise concurrent approvals, duplicate deliveries and rollback when an audit write fails.' },
      { label: 'Run in CI', body: 'GitHub Actions runs the project checks. Browser checks also verify game controls, two-player rooms and source-inspection flows.' }
    ]
  },
  {
    id: 'deploy',
    title: 'Deploy',
    eyebrow: '06 / Deployment',
    shortDescription: 'Live games and prepared cloud templates.',
    description: 'Sugun Games is live on Vercel with a GitHub Pages mirror. The workbench and evidence demo have local run instructions and undeployed Azure templates.',
    color: '#418dff',
    skills: ['Vercel', 'GitHub Pages', 'Docker Compose', 'Azure templates', 'Health checks'],
    projectIds: ['sugun-games', 'inception-workbench', 'your-senior'],
    steps: [
      { label: 'Publish', body: 'The arcade serves static assets on Vercel; GitHub Actions tests and publishes the Pages mirror.' },
      { label: 'Verify', body: 'Published game assets were checked against the merged files, and two browser clients joined a live race room.' },
      { label: 'Cloud preparation', body: 'The workbench and evidence demo include Azure Container Apps templates. Those templates are preparation, not proof of a cloud deployment.' }
    ]
  }
];
