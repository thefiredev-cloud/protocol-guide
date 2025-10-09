export type ErrorResponse = {
  error: {
    code: string;
    message: string;
  };
};

export type Paged<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

export type RequestContext = {
  ipAddress?: string;
  userAgent?: string;
};


