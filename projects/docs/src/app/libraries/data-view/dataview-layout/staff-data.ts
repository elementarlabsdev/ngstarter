export type StaffStatusTone = 'active' | 'pending' | 'inactive';

export interface StaffStatus {
  id: 'active' | 'pending' | 'inactive';
  label: string;
  tone: StaffStatusTone;
}

export interface StaffMember {
  id: string;
  name: string;
  position: string;
  hireDate: string;
  agreement: string;
  hireType: 'Salary' | 'Contact' | 'Hourly' | 'Intern';
  salaryRate: string;
  status: StaffStatus;
}

type StaffMemberRow = [
  StaffMember['id'],
  StaffMember['name'],
  StaffMember['position'],
  StaffMember['hireDate'],
  StaffMember['agreement'],
  StaffMember['hireType'],
  StaffMember['salaryRate'],
  StaffStatus['id']
];

export const STAFF_STATUSES: StaffStatus[] = [
  {
    id: 'active',
    label: 'Active Staff',
    tone: 'active'
  },
  {
    id: 'pending',
    label: 'Pending Staff',
    tone: 'pending'
  },
  {
    id: 'inactive',
    label: 'Inactive Staff',
    tone: 'inactive'
  }
];

const statusById = new Map(STAFF_STATUSES.map(status => [status.id, status]));

const STAFF_MEMBER_ROWS: StaffMemberRow[] = [
  ['#80123098', 'Anderson Dark', 'General Manager', '24 July 2024', '2 Years', 'Salary', '$1500.00', 'active'],
  ['#80123066', 'White Elephant', 'Room Cleaner', '22 July 2024', '4 Years', 'Contact', '$1000.00', 'active'],
  ['#80123056', 'Mark Ganson', 'Front Desk', '21 March 2022', '6 Years', 'Salary', '$500.00', 'pending'],
  ['#80123041', 'Sugar Soll', 'Designer', '20 July 2024', '2 Month', 'Hourly', '$1000.00', 'active'],
  ['#80123040', 'Criss Brak', 'Marketing Manager', '17 July 2024', '9 Month', 'Salary', '$3000.00', 'active'],
  ['#80123030', 'Lionel Messi', 'Cleaner Staff', '16 July 2024', '12 Month', 'Intern', '$1200.00', 'pending'],
  ['#80123028', 'Ronaldo Praso', 'Room Cleaner', '15 July 2024', '2 Years', 'Salary', '$1000.00', 'active'],
  ['#80123026', 'Benzema Cor', 'Room Cleaner', '14 July 2024', '5 Years', 'Salary', '$1900.00', 'inactive'],
  ['#80123024', 'Mesot Mark', 'Office Manager', '12 July 2024', '1 Years', 'Salary', '$500.00', 'active'],
  ['#80123023', 'Muhammad M', 'Room Cleaner', '11 July 2024', '4 Years', 'Salary', '$1000.00', 'active'],
  ['#80123021', 'Helena West', 'Front Desk', '10 July 2024', '3 Years', 'Salary', '$1600.00', 'active'],
  ['#80123019', 'Dmitry Lance', 'Security Lead', '9 July 2024', '2 Years', 'Contact', '$2100.00', 'pending'],
  ['#80123017', 'Rina Stone', 'Accountant', '8 July 2024', '7 Years', 'Salary', '$2600.00', 'active'],
  ['#80123015', 'Maya Russell', 'Concierge', '6 July 2024', '8 Month', 'Hourly', '$900.00', 'inactive']
];

export const STAFF_MEMBERS: StaffMember[] = STAFF_MEMBER_ROWS.map(([id, name, position, hireDate, agreement, hireType, salaryRate, statusId]) => ({
  id,
  name,
  position,
  hireDate,
  agreement,
  hireType,
  salaryRate,
  status: statusById.get(statusId as StaffStatus['id']) ?? STAFF_STATUSES[0]
}));
