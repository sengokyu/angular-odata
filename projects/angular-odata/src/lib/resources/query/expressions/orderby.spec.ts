import { OrderByExpression } from './orderby';

describe('OData orderBy builder', () => {
  interface Pet {
    Id?: number;
    Name?: string;
    Age?: number;
    Person?: Person;
  }

  interface Model {
    Id?: number;
    Name?: string;
  }

  interface Car {
    Id?: number;
    Model?: Model;
    Year?: number;
  }

  interface Person {
    Id?: number;
    Name?: string;
    Age?: number;
    IsCorrect?: boolean;
    EditedOn?: boolean;
    CreatedOn?: boolean;
    Car?: Car;
    Pets?: Pet[];
  }

  describe('base condition', () => {
    describe('as factory function', () => {
      it('asc', () => {
        const compare1 = OrderByExpression.orderBy<Person>(({ e, s }) =>
          e().ascending(s.Age)
        );

        expect(compare1.render()).toBe('Age asc');
      });

      it('desc', () => {
        const compare1 = OrderByExpression.orderBy<Person>(({ e, s }) =>
          e().descending(s.Age)
        );

        expect(compare1.render()).toBe('Age desc');
      });
    });

    describe('combination e().ascending(...).descending(...)', () => {
      it('asc,desc', () => {
        const compare = OrderByExpression.orderBy<Person>(({ e, s }) =>
          e().ascending(s.Age).descending(s.CreatedOn)
        );

        expect(compare.render()).toBe('Age asc,CreatedOn desc');
      });
    });

    describe('navigate main', () => {
      it('navigate', () => {
        const compare1 = OrderByExpression.orderBy<Person>(({ e, s }) =>
          e().ascending(s.Car!.Year)
        );
        expect(compare1.render()).toBe('Car/Year asc');
      });

      it('combination navigate', () => {
        const compare1 = OrderByExpression.orderBy<Person>(({ e, s }) =>
          e().ascending(s.Car!.Year).descending(s.Car!.Model!.Name)
        );
        expect(compare1.render()).toBe('Car/Year asc,Car/Model/Name desc');
      });
    });
  });
});
