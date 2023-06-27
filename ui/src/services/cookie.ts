export function setCookie(
  cname: string,
  cvalue: string,
  expSec: number,
  path?: string
): void {
  const d = new Date();
  d.setTime(d.getTime() + expSec * 1000);
  const expires = 'expires=' + d.toUTCString();
  document.cookie =
    cname + '=' + cvalue + ';' + expires + `;path=${path || '/'}`;
}
