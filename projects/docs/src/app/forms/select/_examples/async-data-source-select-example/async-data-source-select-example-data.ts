export interface UserOption {
  id: string;
  name: string;
  team: string;
}

const FEATURED_USERS: UserOption[] = [
  { id: 'user-1', name: 'Ada Lovelace', team: 'Platform' },
  { id: 'user-2', name: 'Grace Hopper', team: 'Infrastructure' },
  { id: 'user-3', name: 'Alan Turing', team: 'Research' },
  { id: 'user-4', name: 'Katherine Johnson', team: 'Analytics' },
  { id: 'user-5', name: 'Margaret Hamilton', team: 'Reliability' },
  { id: 'user-6', name: 'Radia Perlman', team: 'Networking' },
  { id: 'user-7', name: 'Mary Jackson', team: 'Operations' },
  { id: 'user-8', name: 'Dorothy Vaughan', team: 'Operations' },
  { id: 'user-9', name: 'Barbara Liskov', team: 'Runtime' },
  { id: 'user-10', name: 'Frances Allen', team: 'Compiler' },
  { id: 'user-11', name: 'Evelyn Boyd Granville', team: 'Analytics' },
  { id: 'user-12', name: 'Annie Easley', team: 'Platform' },
  { id: 'user-13', name: 'Karen Sparck Jones', team: 'Search' },
  { id: 'user-14', name: 'Jean Sammet', team: 'Language' },
  { id: 'user-15', name: 'Sister Mary Kenneth Keller', team: 'Education' }
];

const FIRST_NAMES = [
  'Alex',
  'Blair',
  'Casey',
  'Dana',
  'Elliot',
  'Finley',
  'Harper',
  'Jordan',
  'Morgan',
  'Parker',
  'Quinn',
  'Riley',
  'Rowan',
  'Sawyer',
  'Taylor',
  'Avery',
  'Cameron',
  'Drew',
  'Emerson',
  'Hayden'
];

const LAST_NAMES = [
  'Anderson',
  'Bennett',
  'Carter',
  'Diaz',
  'Ellis',
  'Foster',
  'Garcia',
  'Hayes',
  'Iverson',
  'Jensen',
  'Kim',
  'Lopez',
  'Miller',
  'Nguyen',
  'Owens',
  'Patel',
  'Reed',
  'Santos',
  'Turner',
  'Walker'
];

const TEAMS = [
  'Platform',
  'Infrastructure',
  'Research',
  'Analytics',
  'Reliability',
  'Networking',
  'Operations',
  'Runtime',
  'Compiler',
  'Search',
  'Language',
  'Education'
];

const GENERATED_USERS: UserOption[] = Array.from({ length: 185 }, (_, index) => {
  const id = FEATURED_USERS.length + index + 1;

  return {
    id: `user-${id}`,
    name: `${FIRST_NAMES[index % FIRST_NAMES.length]} ${LAST_NAMES[Math.floor(index / FIRST_NAMES.length) % LAST_NAMES.length]}`,
    team: TEAMS[index % TEAMS.length]
  };
});

export const USER_OPTIONS: UserOption[] = [
  ...FEATURED_USERS,
  ...GENERATED_USERS
];
