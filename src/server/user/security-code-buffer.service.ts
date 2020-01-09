import * as crypto from 'crypto';

export class SecurityCodeBufferService {
  private static securityCode?: string = '';

  public static gen() {
    this.securityCode = crypto.randomBytes(64).toString('base64');
    // tslint:disable-next-line: no-console
    console.log('ADMIN SECURITY CODE', this.securityCode);
  }

  public static compare(securityCode: string): boolean {
    if (this.securityCode === '') {
      return false;
    }
    if (this.securityCode === securityCode) {
      this.securityCode = '';
      return true;
    }
    this.securityCode = '';
    return false;
  }
}
