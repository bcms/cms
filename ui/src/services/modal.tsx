import type { DefineComponent } from 'vue';
import {
    ModalConfirm,
    type ModalConfirmInput,
} from '@bcms/selfhosted-ui/components/modals/confirm';
import { ModalMediaCreateDir } from '@bcms/selfhosted-ui/components/modals/media/create-dir';
import { ModalMediaCreateFile } from '@bcms/selfhosted-ui/components/modals/media/create-file';
import {
    type ModalEntryContentLindEditInput,
    type ModalEntryContentLindEditOutput,
    ModalEntryContentLinkEdit,
} from '@bcms/selfhosted-ui/components/modals/entry/content/link-edit';
import {
    ModalTemplateCreateEdit,
    type ModalTemplateCreateEditInput,
} from '@bcms/selfhosted-ui/components/modals/template/create-edit';
import {
    ModalPropCreate,
    type ModalPropCreateInput,
    type ModalPropCreateOutput,
} from '@bcms/selfhosted-ui/components/modals/props/create';
import {
    ModalGroupCreateEdit,
    type ModalGroupCreateEditInput,
} from '@bcms/selfhosted-ui/components/modals/group/create-edit';
import {
    ModalPropUpdate,
    type ModalPropUpdateInput,
    type ModalPropUpdateOutput,
} from '@bcms/selfhosted-ui/components/modals/props/update';
import {
    ModalWhereIsItUsedResults,
    type ModalWhereIsItUsedResultsInput,
} from '@bcms/selfhosted-ui/components/modals/where-is-it-used-results';
import {
    ModalWidgetCreateEdit,
    type ModalWidgetCreateEditInput,
} from '@bcms/selfhosted-ui/components/modals/widget/create-edit';
import {
    ModalUserAddEdit,
    type ModalUserAddEditInput,
} from '@bcms/selfhosted-ui/components/modals/user/add-edit';
import {
    ModalUserPolicy,
    type ModalUserPolicyInput,
} from '@bcms/selfhosted-ui/components/modals/user/policy';
import {
    ModalApiKeyCreateEdit,
    type ModalApiKeyCreateEditInput,
} from '@bcms/selfhosted-ui/components/modals/api-key/create-edit';
import {
    ModalMediaSelect,
    type ModalMediaSelectInput,
    type ModalMediaSelectOutput,
} from '@bcms/selfhosted-ui/components/modals/media/select';
import {
    ModalMediaEditAltCaption,
    type ModalMediaEditAltCaptionInput,
    type ModalMediaEditAltCaptionOutput,
} from '@bcms/selfhosted-ui/components/modals/media/edit-alt-caption';
import {
    ModalEntryViewModel,
    type ModalEntryViewModelInput,
} from '@bcms/selfhosted-ui/components/modals/entry/view-model';
import { ModalEntryStatusCreateEdit } from '@bcms/selfhosted-ui/components/modals/entry-status/create-edit';
import { ModalBackupRestore } from '@bcms/selfhosted-ui/components/modals/backup/restore';

export interface ModalHandlerOptions<Output = unknown> {
    title?: string;
    onDone?(output: Output): void | Promise<void>;
    onCancel?(): void | Promise<void>;
}

export class ModalHandler<Input = unknown, Output = unknown> {
    constructor(
        public element: DefineComponent<
            any,
            any,
            any,
            any,
            any,
            any,
            any,
            any,
            any,
            any
        >,
    ) {}

    public open: (
        options?: ModalHandlerOptions<Output> & {
            data?: Input;
        },
    ) => void = () => {
        throw Error('Method not implemented');
    };
    public close: (isDone?: boolean, doneValue?: Output) => void = async () => {
        throw Error('Method not implemented');
    };
    public _onOpen: (
        options?: ModalHandlerOptions<Output> & {
            data?: Input;
        },
    ) => void = () => {
        throw Error('Method not implemented');
    };
    public _onDone: () => Promise<[boolean, Output]> = async () => {
        throw Error('Method not implemented');
    };
    public _onCancel: () => Promise<boolean> = async () => {
        throw Error('Method not implemented');
    };
}

export class ModalService {
    handlers = {
        confirm: new ModalHandler<ModalConfirmInput>(ModalConfirm),

        userAddEdit: new ModalHandler<ModalUserAddEditInput, void>(
            ModalUserAddEdit,
        ),
        userPolicy: new ModalHandler<ModalUserPolicyInput, void>(
            ModalUserPolicy,
        ),

        mediaCreateDir: new ModalHandler<void, void>(ModalMediaCreateDir),
        mediaCreateFile: new ModalHandler<void, void>(ModalMediaCreateFile),
        mediaSelect: new ModalHandler<
            ModalMediaSelectInput,
            ModalMediaSelectOutput
        >(ModalMediaSelect),
        mediaEditAltCaption: new ModalHandler<
            ModalMediaEditAltCaptionInput,
            ModalMediaEditAltCaptionOutput
        >(ModalMediaEditAltCaption),

        entryContentLinkEdit: new ModalHandler<
            ModalEntryContentLindEditInput,
            ModalEntryContentLindEditOutput
        >(ModalEntryContentLinkEdit),
        entryViewModel: new ModalHandler<ModalEntryViewModelInput, void>(
            ModalEntryViewModel,
        ),

        templateCreateEdit: new ModalHandler<
            ModalTemplateCreateEditInput,
            void
        >(ModalTemplateCreateEdit),

        groupCreateEdit: new ModalHandler<ModalGroupCreateEditInput, void>(
            ModalGroupCreateEdit,
        ),

        widgetCreateEdit: new ModalHandler<ModalWidgetCreateEditInput, void>(
            ModalWidgetCreateEdit,
        ),

        propCreate: new ModalHandler<
            ModalPropCreateInput,
            ModalPropCreateOutput
        >(ModalPropCreate),
        propUpdate: new ModalHandler<
            ModalPropUpdateInput,
            ModalPropUpdateOutput
        >(ModalPropUpdate),

        whereIsItUsedResults: new ModalHandler<
            ModalWhereIsItUsedResultsInput,
            void
        >(ModalWhereIsItUsedResults),

        apiKeyCreateEdit: new ModalHandler<ModalApiKeyCreateEditInput, void>(
            ModalApiKeyCreateEdit,
        ),

        entryStatusCreateEdit: new ModalHandler<void, void>(
            ModalEntryStatusCreateEdit,
        ),

        backupRestore: new ModalHandler<void, void>(ModalBackupRestore),
    };

    mount() {
        const elementArr: Array<ModalHandler<any, any>> = [];
        for (const handlersKey in this.handlers) {
            elementArr.push(this.handlers[handlersKey as ModalHandlers]);
        }
        return (
            <>
                {elementArr.map((handler) => {
                    const El = handler.element;
                    return <El handler={handler} />;
                })}
            </>
        );
    }
}

export const modalService = new ModalService();

export type ModalHandlers = keyof typeof modalService.handlers;
