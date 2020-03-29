export interface UserPolicy {
  media: {
    get: boolean;
    post: boolean;
    put: boolean;
    delete: boolean;
  };
  customPortal: {
    get: boolean;
    post: boolean;
    put: boolean;
    delete: boolean;
  };
  templates: Array<{
    _id: string;
    get: boolean;
    post: boolean;
    put: boolean;
    delete: boolean;
  }>;
  webhooks: Array<{
    _id: string;
    get: boolean;
    post: boolean;
    put: boolean;
    delete: boolean;
  }>;
}
