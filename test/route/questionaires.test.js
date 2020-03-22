import chai from 'chai';
import chaiHttp from 'chai-http';
chai.use(chaiHttp);
const assert = chai.assert;

import server from '../../src';

describe("Questionaires", () => {
  /**
   * GET all questionaires
   */
  describe("GET /questionaires", () => {
    it("it should return 404 when requestion all questionaires", async () => {
      let res = await chai.request(server).get('/v1/questionaires');

      assert.equal(res.status, 404);
    });
  });

  /**
   * GET a single questionaires
   */
  describe("GET /questionaires/default", () => {
    it("it should return 404 when requestion a single questionaire", async () => {
      let res = await chai.request(server).get('/v1/questionaires/default');

      assert.equal(res.status, 404);
    });
  });

  /**
   * PUT /questionaires/{name}
   */
  describe("PUT /questionaires/basic", () => {
    let valid_data = {
      'locale': 'nl_nl',
      'email': 'symptotrack@forest.host', // @TODO should this be optional?

      // Form data

      // coordinates
      'coordinates': [ 5.1214201, 52.0907374 ],
      // number, year
      'year_of_birth': '1987',
      // select
      'sex': 'non-binary',
      // bool
      'fever': true,
      // number, temperature
      'fever_degrees': 31,
      // bool
      'dry_cough': false,
      'tired': 'skip', // @TODO maybe not post when skip?
      // text
      'other_symptons': 'Im crayz',
      // number
      'home_leaves': 10,
      // multiselect, countries
      'travel_last_2_weeks': [ 'NLD' ]
    };

    /**
     * Succesful entry
     */
    it("should return magic link (and sent mail)", async () => {
      let res = await chai.request(server).put('/v1/questionaires/basic').send(valid_data);

      assert.equal(res.status, 200);
      assert.equal(res.body.link, 'string'); // our magic link
    });

    /**
     * Missing required fields
     */
    it("should return errors for missing required fields", async () => {
      let res = await chai.request(server).put('/v1/questionaires/basic');

      assert.equal(res.status, 400);
      assert.equal(res.body.errors.locale, 'Field is required'); // Every field is returned in errors with a message
    });

    /**
     * Validation errors
     */
    it("should return error when validation errors occur", async () => {
      let res = await chai.request(server).put('/v1/questionaires/basic')
        .send({
          'locale': 'nl_nl',
          'email': 'notmyemail',
          'coordinates': [ 40000, 40000 ], // Covid is not yet a problem in space, invalid coordinates
          'year_of_birth': 'long ago', // Should be year
          'sex': 'can be anything',
          'fever': false,
          'fever_degrees': 66.67666, // Should be number with 1 decimal, also 'fever' is false so we dont expect this answer
          'dry_cough': 'string', // should be bool
          'home_leaves': 10.111, // no decimals
          'travel_last_2_weeks': [ 'Trisolaris' ] // Country does not exist, also not an ALPHA-3
        });

      assert.equal(res.status, 400);
      assert.equal(res.body.errors.email, 'Not a valid email');
      assert.equal(res.body.errors.coordinates, 'Not a valid coordinate');
      assert.equal(res.body.errors.year_of_birth, 'Not a valid number (decimals: 0, tag: year)');
      assert.equal(res.body.errors.fever_degrees, 'Question is not asked');
      assert.equal(res.body.errors.dry_cough, 'Not a valid bool');
      assert.equal(res.body.errors.home_leaves, 'Not a valid number (decimals: 0)');
      assert.equal(res.body.errors.travel_last_2_weeks, 'Not a valid answer (only defined answers are allowed)'); // same error as select, works just the same
    });

  });

});
