import { gql } from 'graphql-tag';
import { DocumentNode } from 'graphql';

export const typeDefs: DocumentNode = gql`
  scalar DateTime
  scalar JSON

  # Auth Types
  type User {
    id: ID!
    email: String!
    name: String
    avatar: String
    phone: String
    emailVerified: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
    households: [HouseholdMember!]!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  # Household Types
  type Household {
    id: ID!
    name: String!
    description: String
    createdBy: User!
    members: [HouseholdMember!]!
    kitchens: [Kitchen!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type HouseholdMember {
    id: ID!
    user: User!
    household: Household!
    role: HouseholdRole!
    joinedAt: DateTime!
  }

  enum HouseholdRole {
    OWNER
    ADMIN
    MEMBER
    VIEWER
  }

  # Kitchen Types
  type Kitchen {
    id: ID!
    household: Household!
    name: String!
    description: String
    type: KitchenType!
    inventory: [InventoryItem!]!
    shopping: [ShoppingList!]!
    expenses: [Expense!]!
    reminders: [Reminder!]!
    logs: [UsageLog!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum KitchenType {
    HOME
    OFFICE
    PG
    HOSTEL
  }

  # Inventory Types
  type InventoryItem {
    id: ID!
    kitchen: Kitchen!
    name: String!
    category: String!
    imageUrl: String
    defaultUnit: String!
    threshold: Float
    brand: String
    tags: [String!]!
    location: StorageLocation!
    batches: [InventoryBatch!]!
    usageLogs: [UsageLog!]!
    createdAt: DateTime!
    updatedAt: DateTime!
    
    # Computed fields
    totalQuantity: Float!
    status: InventoryStatus!
    nextExpiry: DateTime
  }

  type InventoryBatch {
    id: ID!
    item: InventoryItem!
    quantity: Float!
    unit: String!
    expiryDate: DateTime
    purchaseDate: DateTime
    purchasePrice: Float
    vendor: String
    status: BatchStatus!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum StorageLocation {
    PANTRY
    FRIDGE
    FREEZER
    CONTAINER
    CABINET
  }

  enum BatchStatus {
    ACTIVE
    USED
    EXPIRED
    WASTED
  }

  enum InventoryStatus {
    OK
    LOW
    EXPIRING
    EXPIRED
  }

  # Shopping Types
  type ShoppingList {
    id: ID!
    kitchen: Kitchen!
    type: ShoppingListType!
    title: String!
    description: String
    forDate: DateTime
    isCompleted: Boolean!
    items: [ShoppingListItem!]!
    createdAt: DateTime!
    updatedAt: DateTime!
    
    # Computed fields
    totalItems: Int!
    completedItems: Int!
    estimatedTotal: Float!
  }

  type ShoppingListItem {
    id: ID!
    list: ShoppingList!
    name: String!
    quantity: Float
    unit: String
    linkedItemId: String
    isPurchased: Boolean!
    price: Float
    notes: String
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum ShoppingListType {
    DAILY
    WEEKLY
    MONTHLY
    FESTIVAL
    EVENT
    CUSTOM
  }

  # Expense Types
  type Expense {
    id: ID!
    kitchen: Kitchen!
    type: ExpenseType!
    amount: Float!
    vendor: String
    date: DateTime!
    billImageUrl: String
    items: JSON
    notes: String
    category: String
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum ExpenseType {
    RATION
    FOOD_ORDER
    GROCERY
    VEGETABLES
    FRUITS
    DAIRY
    MEAT
    OTHER
  }

  # Reminder Types
  type Reminder {
    id: ID!
    kitchen: Kitchen!
    type: ReminderType!
    title: String!
    description: String
    scheduledAt: DateTime!
    isRecurring: Boolean!
    frequency: String
    isCompleted: Boolean!
    meta: JSON
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum ReminderType {
    LOW_STOCK
    EXPIRY
    SHOPPING
    FESTIVAL
    APPLIANCE
    GAS_CYLINDER
    WATER_CAN
    CUSTOM
  }

  # Usage Log Types
  type UsageLog {
    id: ID!
    kitchen: Kitchen!
    item: InventoryItem!
    type: UsageLogType!
    quantity: Float!
    unit: String!
    notes: String
    date: DateTime!
    createdAt: DateTime!
  }

  enum UsageLogType {
    COOKED
    CONSUMED
    WASTED
    PURCHASED
    ADJUSTED
  }

  # Recipe Types
  type RecipeHistory {
    id: ID!
    kitchenId: String
    title: String!
    ingredients: JSON!
    steps: JSON!
    cuisine: String
    prepTime: Int
    calories: Int
    source: String!
    isFavorite: Boolean!
    createdAt: DateTime!
  }

  # AI Scan Types
  type AIScan {
    id: ID!
    imageUrl: String!
    scanType: String!
    result: JSON!
    confidence: Float
    processed: Boolean!
    createdAt: DateTime!
  }

  # Input Types
  input RegisterInput {
    email: String!
    password: String!
    name: String
  }

  input LoginInput {
    email: String!
    password: String!
  }

  type ForgotPasswordResponse {
    success: Boolean!
    message: String!
  }

  type ResetPasswordResponse {
    success: Boolean!
    message: String!
  }

  input CreateHouseholdInput {
    name: String!
    description: String
  }

  input CreateKitchenInput {
    householdId: ID!
    name: String!
    description: String
    type: KitchenType!
  }

  input CreateInventoryItemInput {
    kitchenId: ID!
    name: String!
    category: String!
    imageUrl: String
    defaultUnit: String!
    threshold: Float
    brand: String
    tags: [String!]
    location: StorageLocation!
  }

  input CreateInventoryBatchInput {
    itemId: ID!
    quantity: Float!
    unit: String!
    expiryDate: DateTime
    purchaseDate: DateTime
    purchasePrice: Float
    vendor: String
  }

  input UpdateInventoryItemInput {
    name: String
    category: String
    imageUrl: String
    defaultUnit: String
    threshold: Float
    brand: String
    tags: [String!]
    location: StorageLocation
  }

  input CreateShoppingListInput {
    kitchenId: ID!
    type: ShoppingListType!
    title: String!
    description: String
    forDate: DateTime
  }

  input CreateShoppingListItemInput {
    listId: ID!
    name: String!
    quantity: Float
    unit: String
    linkedItemId: String
    price: Float
    notes: String
  }

  input CreateExpenseInput {
    kitchenId: ID!
    type: ExpenseType!
    amount: Float!
    vendor: String
    date: DateTime!
    billImageUrl: String
    items: JSON
    notes: String
    category: String
  }

  input CreateReminderInput {
    kitchenId: ID!
    type: ReminderType!
    title: String!
    description: String
    scheduledAt: DateTime!
    isRecurring: Boolean
    frequency: String
    meta: JSON
  }

  input CreateUsageLogInput {
    kitchenId: ID!
    itemId: ID!
    type: UsageLogType!
    quantity: Float!
    unit: String!
    notes: String
  }

  input AIImageScanInput {
    imageUrl: String!
    scanType: String!
  }

  input GenerateRecipeInput {
    kitchenId: ID!
    availableIngredients: [String!]!
    cuisine: String
    prepTime: Int
    dietary: [String!]
  }

  # Queries
  type Query {
    # Auth
    me: User

    # Households
    households: [Household!]!
    household(id: ID!): Household

    # Kitchens
    kitchens(householdId: ID!): [Kitchen!]!
    kitchen(id: ID!): Kitchen

    # Inventory
    inventoryItems(kitchenId: ID!): [InventoryItem!]!
    inventoryItem(id: ID!): InventoryItem
    lowStockItems(kitchenId: ID!): [InventoryItem!]!
    expiringItems(kitchenId: ID!, days: Int = 7): [InventoryItem!]!

    # Shopping
    shoppingLists(kitchenId: ID!): [ShoppingList!]!
    shoppingList(id: ID!): ShoppingList

    # Expenses
    expenses(kitchenId: ID!, limit: Int = 50): [Expense!]!
    expense(id: ID!): Expense
    expenseStats(kitchenId: ID!, period: String!): JSON!

    # Reminders
    reminders(kitchenId: ID!): [Reminder!]!
    upcomingReminders(kitchenId: ID!, days: Int = 7): [Reminder!]!

    # Usage Logs
    usageLogs(kitchenId: ID!, limit: Int = 100): [UsageLog!]!

    # Recipes
    recipeHistory(kitchenId: ID): [RecipeHistory!]!
    generateRecipe(input: GenerateRecipeInput!): JSON!

    # AI
    aiScans(limit: Int = 20): [AIScan!]!
  }

  # Mutations
  type Mutation {
    # Auth
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    logout: Boolean!
    forgotPassword(email: String!): ForgotPasswordResponse!
    resetPassword(token: String!, newPassword: String!): ResetPasswordResponse!

    # Households
    createHousehold(input: CreateHouseholdInput!): Household!
    updateHousehold(id: ID!, input: CreateHouseholdInput!): Household!
    deleteHousehold(id: ID!): Boolean!
    inviteMember(householdId: ID!, email: String!, role: HouseholdRole!): Boolean!

    # Kitchens
    createKitchen(input: CreateKitchenInput!): Kitchen!
    updateKitchen(id: ID!, input: CreateKitchenInput!): Kitchen!
    deleteKitchen(id: ID!): Boolean!

    # Inventory
    createInventoryItem(input: CreateInventoryItemInput!): InventoryItem!
    updateInventoryItem(id: ID!, input: UpdateInventoryItemInput!): InventoryItem!
    deleteInventoryItem(id: ID!): Boolean!
    
    createInventoryBatch(input: CreateInventoryBatchInput!): InventoryBatch!
    updateInventoryBatch(id: ID!, quantity: Float, expiryDate: DateTime): InventoryBatch!
    deleteInventoryBatch(id: ID!): Boolean!

    # Shopping
    createShoppingList(input: CreateShoppingListInput!): ShoppingList!
    updateShoppingList(id: ID!, title: String, description: String): ShoppingList!
    deleteShoppingList(id: ID!): Boolean!
    
    createShoppingListItem(input: CreateShoppingListItemInput!): ShoppingListItem!
    updateShoppingListItem(id: ID!, isPurchased: Boolean, price: Float): ShoppingListItem!
    deleteShoppingListItem(id: ID!): Boolean!

    # Expenses
    createExpense(input: CreateExpenseInput!): Expense!
    updateExpense(id: ID!, amount: Float, notes: String): Expense!
    deleteExpense(id: ID!): Boolean!

    # Reminders
    createReminder(input: CreateReminderInput!): Reminder!
    updateReminder(id: ID!, isCompleted: Boolean): Reminder!
    deleteReminder(id: ID!): Boolean!

    # Usage Logs
    createUsageLog(input: CreateUsageLogInput!): UsageLog!

    # AI
    scanImage(input: AIImageScanInput!): AIScan!
    processAIScan(scanId: ID!): JSON!

    # OCR
    processReceiptOCR(imageUrl: String!): OCRResult!
    processInventoryItemOCR(imageUrl: String!): OCRResult!
    createInventoryFromReceipt(receiptData: ReceiptDataInput!, kitchenId: ID!): InventoryCreationResult!

    # Bulk Operations
    bulkCreateInventoryItems(items: [CreateInventoryItemInput!]!): [InventoryItem!]!
    bulkUpdateInventoryQuantities(updates: [JSON!]!): Boolean!
  }

  # OCR Types
  type OCRResult {
    success: Boolean!
    data: JSON
    message: String!
  }

  type InventoryCreationResult {
    success: Boolean!
    items: [InventoryItem!]
    message: String!
  }

  input ReceiptDataInput {
    vendor: String
    date: String
    total: Float
    items: [ReceiptItemInput!]!
    category: String
  }

  input ReceiptItemInput {
    name: String!
    quantity: Float
    price: Float
    unit: String
  }

  # Subscriptions
  type Subscription {
    inventoryUpdated(kitchenId: ID!): InventoryItem!
    reminderTriggered(kitchenId: ID!): Reminder!
    shoppingListUpdated(listId: ID!): ShoppingList!
  }
`;