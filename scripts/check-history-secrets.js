import { spawnSync } from 'node:child_process';

const markers = ['mongodb' + '+srv', 'AI' + 'za'];
let found = false;

for (const marker of markers) {
  const result = spawnSync(
    'git',
    ['log', '--all', '--format=%H', '-S', marker, '--', '.'],
    { encoding: 'utf8' },
  );

  if (result.error || result.status !== 0) {
    console.error('Unable to scan Git history for sensitive values.');
    process.exitCode = 2;
    break;
  }

  if (result.stdout.trim()) {
    console.error('Potential sensitive value found in reachable Git history. Revoke it and remove it from history before release.');
    found = true;
  }
}

if (found) {
  process.exitCode = 1;
} else if (process.exitCode !== 2) {
  console.log('No configured sensitive-value patterns found in reachable Git history.');
}
