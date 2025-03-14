import { getAllSprints } from "@/actions/sprints";

export default async function SprintsPage() {
  const sprints = await getAllSprints();

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-4">All Sprints</h1>
      {sprints.length === 0 ? (
        <p>No sprints found.</p>
      ) : (
        <ul>
          {sprints.map((sprint) => (
            <li key={sprint.id}>
              {sprint.name} - {sprint.status}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
