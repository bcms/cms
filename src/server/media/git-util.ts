import * as util from 'util';
import * as childProcess from 'child_process';
import * as path from 'path';
import { Logger } from 'purple-cheetah';
import { Media } from './models/media.model';

export class GitUtil {
  private static readonly logger = new Logger('GitUtil');

  public static updateUploads(media: Media) {
    if (
      process.env.GIT_USERNAME &&
      process.env.GIT_USERNAME !== 'github-username' &&
      process.env.GIT_PASSWORD &&
      process.env.GIT_PASSWORD !== 'github-password' &&
      process.env.GIT_REPO &&
      process.env.GIT_REPO_OWNER &&
      process.env.GIT_HOST
    ) {
      util
        .promisify(childProcess.exec)(
          `git add ${path.join(process.env.PROJECT_ROOT, 'uploads')}/. && ` +
            `git commit -m "Adding file ${media.name} via CMS." && ` +
            `git push "https://${process.env.GIT_USERNAME}:${process.env.GIT_PASSWORD}@` +
            `${process.env.GIT_HOST}/${process.env.GIT_REPO_OWNER}/${process.env.GIT_REPO}"`,
        )
        .then(output => {
          GitUtil.logger.info('git-push', `File ${media.name} added to GIT.`);
        })
        .catch(e => {
          GitUtil.logger.error('git-push', e);
        });
    }
  }
}
