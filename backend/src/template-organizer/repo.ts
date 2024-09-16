import { createMongoDBRepository } from '@thebcms/selfhosted-backend/_server/modules/mongodb';
import { Config } from '@thebcms/selfhosted-backend/config';
import {
    type TemplateOrganizer,
    TemplateOrganizerSchema,
} from '@thebcms/selfhosted-backend/template-organizer/models/main';

export const TemplateOrganizerRepo = createMongoDBRepository<
    TemplateOrganizer,
    void
>({
    name: 'TemplateOrganizerRepo',
    collection: `${Config.storageScope}_template_organizers`,
    schema: TemplateOrganizerSchema,
});
