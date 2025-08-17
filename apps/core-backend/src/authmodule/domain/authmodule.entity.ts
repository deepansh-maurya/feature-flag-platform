export class AuthEntity {

  private constructor(
    readonly id: string,
    readonly email: string,
    readonly password: string,
    readonly fullName: string,

  ) { }

  static create(params: {
    id: string, email: string, password: string, fullName: string
  }) {

    if (!params.email || !params.password) {
      throw new Error("creds required ")
    }

    return new AuthEntity(params.id, params.email, params.password, params.fullName)

  }
}