const faker = require('faker'); // eslint-disable-line
const { seedData } = require('../utils/seeds/utils');

faker.seed(1000);

const createCook = (knex, i) => {
  const isPro = faker.random.boolean();

  return knex.select('id').from('gourmets').then((gourmets) => {
    const newCook = {
      id: gourmets[i].id,
      is_pro: isPro,
    };

    if (isPro) {
      newCook.business_name = faker.company.companyName();
      newCook.siren = faker.finance.currencyCode();
      newCook.pro_phone_number = faker.phone.phoneNumberFormat();
      newCook.pro_email = faker.internet.email();
      newCook.legal_first_name = faker.name.firstName();
      newCook.legal_last_name = faker.name.lastName();
      newCook.legal_birthdate = faker.date.past();
    }

    return knex('cooks').insert(newCook);
  });
};

exports.seed = seedData('cooks', createCook);
