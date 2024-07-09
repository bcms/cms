import { UserRepo } from '@thebcms/selfhosted-backend/user/repo';
import { ApiKeyRepo } from '@thebcms/selfhosted-backend/api-key/repo';
import { MediaRepo } from '@thebcms/selfhosted-backend/media/repo';
import { GroupRepo } from '@thebcms/selfhosted-backend/group/repo';
import { WidgetRepo } from '@thebcms/selfhosted-backend/widget/repo';
import { TemplateRepo } from '@thebcms/selfhosted-backend/template/repo';
import { EntryRepo } from '@thebcms/selfhosted-backend/entry/repo';
import { LanguageRepo } from '@thebcms/selfhosted-backend/language/repo';
import { EntryStatusRepo } from '@thebcms/selfhosted-backend/entry-status/repo';
import { TemplateOrganizerRepo } from '@thebcms/selfhosted-backend/template-organizer/repo';
import { BackupRepo } from '@thebcms/selfhosted-backend/backup/repo';

export class Repo {
    static readonly user = UserRepo;
    static readonly apiKey = ApiKeyRepo;
    static readonly media = MediaRepo;
    static readonly group = GroupRepo;
    static readonly widget = WidgetRepo;
    static readonly template = TemplateRepo;
    static readonly templateOrganizer = TemplateOrganizerRepo;
    static readonly entry = EntryRepo;
    static readonly language = LanguageRepo;
    static readonly entryStatus = EntryStatusRepo;
    static readonly backup = BackupRepo;
}
