export class AuthEntity {

  private constructor(
    readonly email: string,
    readonly password: string,
    readonly fullName?: string,
    readonly id?: string,

  ) { }

  static create(params: {
    email: string, password: string, fullName?: string, id?: string,
  }) {

    if (!params.email || !params.password) {
      throw new Error("creds required ")
    }

    return new AuthEntity(params.email, params.password, params.fullName, params.id)

  }
}