import { createMongoDBRepository } from '@bcms/selfhosted-backend/_server/modules/mongodb';
import { Config } from '@bcms/selfhosted-backend/config';
import {
    type TemplateOrganizer,
    TemplateOrganizerSchema,
} from '@bcms/selfhosted-backend/template-organizer/models/main';

export const TemplateOrganizerRepo = createMongoDBRepository<
    TemplateOrganizer,
    void
>({
    name: 'TemplateOrganizerRepo',
    collection: `${Config.storageScope}_template_organizers`,
    schema: TemplateOrganizerSchema,
});
