exports.up = knex => (
  knex.schema.createTable('gourmets', (table) => {
    table.uuid('id').primary().index(); // references user pool sub ids
    table.string('email', 255).notNullable();
    table.string('username', 100).notNullable();
    table.string('identity_id');
    table.string('first_name', 100).notNullable();
    table.string('last_name', 100).notNullable();
    table.json('image');
    table.specificType('gender', 'CHAR(1)');
    table.date('birthdate');
    table.string('address', 100);
    table.string('city', 100);
    table.string('zip_code', 10);
    table.specificType('location', 'POINT').defaultTo(knex.raw('POINT (48.390394, -4.486076)'));
    table.text('description');
    table.text('country', 2);
    table.text('nationality', 2);
    table.string('phone_number', 15);
    table.integer('mango_user_id');
    table.integer('mango_wallet_id');
    table.timestamp('deleted_at');
    table.timestamps(true, true);
  }).then(() => {
    knex.raw("ALTER TABLE gourmets ADD CONSTRAINT gender_constraint CHECK(gender='F' OR gender='M' OR gender='U');").then();
  })
);

exports.down = knex => knex.schema.dropTable('gourmets');
