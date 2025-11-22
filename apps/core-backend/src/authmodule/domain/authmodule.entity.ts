export class AuthEntity {
  private constructor(
    readonly email: string,
    readonly password: string | undefined,
    readonly fullName?: string,
    readonly email_verified?:boolean,
    readonly workspace?: string,
    readonly id?: string,
  ) {}

  static create(params: {
    email: string;
    password: string;
    fullName?: string;
    id?: string;
    workspace?: string;
    email_verified?:boolean
  }) {
    if (!params.email || !params.password) {
      throw new Error('creds required ');
    }

    return new AuthEntity(
      params.email,
      params.password,
      params.fullName,
      params.email_verified,
      params.workspace,
      params.id,
    );
  }
}
