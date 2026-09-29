import React from 'react';

interface UserCardProps {
  name: string;
  age: number;
}

export function UserCard({ name, age }: UserCardProps) {
  return (
    <div className="card">
      <h2>{name}</h2>
      <p>Age: {age}</p>
    </div>
  );
}

export default function Page() {
  // BUG: Passes 'email' instead of required 'age' prop to UserCard
  return (
    <main>
      <h1>Profile</h1>
      <UserCard name="Alice" email="alice@example.com" />
    </main>
  );
}
