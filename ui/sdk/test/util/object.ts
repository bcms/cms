export class ObjectUtil {
  static eq(obj: any, comp: any, level?: string): void {
    if (!level) {
      level = 'root';
    }
    if (typeof comp !== typeof obj) {
      throw new Error(
        `[ ${level} ] --> expected "${typeof comp}"` +
          ` but got "${typeof obj}".`,
      );
    }
    if (typeof comp === 'object') {
      if (comp instanceof Array) {
        if (!(obj instanceof Array)) {
          throw new Error(`[ ${level} ] --> expected an array.`);
        }
        if (comp.length !== obj.length) {
          throw new Error(`[ ${level} ] --> arrays are not same length.`);
        }
        for (const i in comp) {
          if (typeof comp[i] === 'object') {
            this.eq(obj[i], comp[i], `${level}[${i}]`);
          } else {
            if (typeof comp[i] !== typeof obj[i]) {
              throw new Error(
                `[ ${level}.[${i}] ] --> expected "${typeof comp[i]}"` +
                  ` but got "${typeof obj[i]}".`,
              );
            }
            if (comp[i] !== obj[i]) {
              throw new Error(
                `[ ${level}[${i}] ] --> "${comp[i]}" in not equal to "${obj[i]}".`,
              );
            }
          }
        }
      } else {
        for (const key in comp) {
          if (typeof obj[key] === 'undefined') {
            throw new Error(
              `[ ${level} ] --> object is missing property "${key}".`,
            );
          }
          this.eq(obj[key], comp[key], `${level}.${key}`);
        }
      }
    } else {
      if (comp !== obj) {
        throw new Error(`[ ${level} ] --> "${comp}" in not equal to "${obj}".`);
      }
    }
  }
  static checkType(obj: any, comp: any, level?: string): void {
    if (!level) {
      level = 'root';
    }
    if (typeof comp !== typeof obj) {
      throw new Error(
        `[ ${level} ] --> expected "${typeof comp}"` +
          ` but got "${typeof obj}".`,
      );
    }
    if (typeof comp === 'object') {
      if (comp instanceof Array) {
        if (!(obj instanceof Array)) {
          throw new Error(`[ ${level} ] --> expected an array.`);
        }
        if (typeof comp[0] === 'object') {
          for (const i in obj) {
            this.checkType(obj[i], comp[0], `${level}[${i}]`);
          }
        } else {
          for (const i in obj) {
            if (typeof comp[0] !== typeof obj[i]) {
              throw new Error(
                `[ ${level}[${i}] ] --> expected "${typeof comp[0]}"` +
                  ` but got "${typeof obj[i]}".`,
              );
            }
          }
        }
      } else {
        for (const key in comp) {
          if (typeof obj[key] === 'undefined') {
            throw new Error(
              `[ ${level} ] --> object is missing property "${key}".`,
            );
          }
          this.checkType(obj[key], comp[key], `${level}.${key}`);
        }
      }
    }
  }
}
