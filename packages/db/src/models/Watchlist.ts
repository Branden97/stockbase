import { Model, DataTypes, InferAttributes, InferCreationAttributes } from '@sequelize/core'
import {
  Attribute,
  Table,
  CreatedAt,
  UpdatedAt,
  PrimaryKey,
  AutoIncrement,
  BelongsTo,
} from '@sequelize/core/decorators-legacy'
import { User } from './User'

@Table({
  tableName: 'watchlists',
  timestamps: true,
})
export class Watchlist extends Model<
  InferAttributes<Watchlist>,
  InferCreationAttributes<Watchlist>
> {
  @PrimaryKey
  @AutoIncrement
  @Attribute(DataTypes.INTEGER)
  declare id: number

  @Attribute(DataTypes.STRING(100))
  declare name: string

  @ForeignKey(() => User)
  @Attribute(DataTypes.INTEGER)
  declare user_id: number

  @BelongsTo(() => User)
  user: User

  @CreatedAt
  @Attribute(DataTypes.DATE)
  declare created_at: Date

  @UpdatedAt
  @Attribute(DataTypes.DATE)
  declare updated_at: Date
}
