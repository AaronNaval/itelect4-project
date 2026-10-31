import type { Submission } from "../types/index";

interface SubmissionBadgeProps {
  submission: Submission;
  children?: React.ReactNode;
}

const SubmissionBadge: React.FC<SubmissionBadgeProps> = ({
  submission,
  children,
}) => {
  return (
    <div className="submission-badge">
      <p>Repo: {submission.repoUrl}</p>
      <p>Submitted: {new Date(submission.createdAt).toLocaleDateString()}</p>
      {children}
    </div>
  );
};

export default SubmissionBadge;