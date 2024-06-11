import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from '@sequelize/core'
import {
  Table,
  Attribute,
  Unique,
  NotNull,
  HasMany,
  BeforeValidate,
  BeforeSave,
} from '@sequelize/core/decorators-legacy'
import bcrypt from 'bcrypt'
import { Watchlist } from './Watchlist'

@Table({
  tableName: 'users',
  timestamps: true,
  paranoid: true,
})
export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  @Unique
  @NotNull
  @Attribute(DataTypes.STRING(50))
  declare username: string

  @Unique
  @NotNull
  @Attribute(DataTypes.STRING(100))
  declare email: string

  @NotNull
  @Attribute(DataTypes.STRING(255))
  declare passwordHash: CreationOptional<string>

  @HasMany(() => Watchlist, 'userId')
  declare watchlists: CreationOptional<Watchlist[]>

  // New-password field for plaintext password
  public newPassword?: string = undefined

  // set newPassword upon instance creation
  constructor(values?: InferCreationAttributes<User>) {
    super(values)
    this.newPassword = values?.newPassword
  }

  // TODO: method for comparing plaintext password with hashed password

  @BeforeSave
  @BeforeValidate
  static async hashPassword(instance: User) {
    if (instance.newPassword) {
      instance.passwordHash = await bcrypt.hash(instance.newPassword, 10)
      instance.newPassword = undefined
    }
  }
}
