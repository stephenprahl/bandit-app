"use client";
import { getProject } from "@/actions/projects";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import TimelineBoard from "./timeline-board";

export default function TimelinePage({ params }) {
  const [project, setProject] = useState(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const data = await getProject(params.projectId);
      setProject(data);
    })();
  }, []);

  if (!project) {
    return <div>Project not found or you lack access.</div>;
  }

  return (
    <div>
      <button onClick={() => router.back()}>Back</button>
      <TimelineBoard sprints={project.sprints} issues={project.issues} />
    </div>
  );
}
