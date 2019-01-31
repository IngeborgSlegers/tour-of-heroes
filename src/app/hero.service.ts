import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { MessageService } from './message.service';
import { Hero } from './hero';
// import { HEROES } from './mock-heroes';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({providedIn: 'root'})
export class HeroService {

  private heroesUrl = 'api/heroes'; // URL to web api

  constructor(
    private http: HttpClient,
    private messageService: MessageService) { }

  /** GET heroes from the server */
  getHeroes (): Observable<Hero[]> {
    return this.http.get<Hero[]>(this.heroesUrl)
      .pipe(
        tap(_ => this.log('Fetched heroes')),
        catchError(this.handleError('getHeroes', []))
      );
  }

  /** GET hero by id. Return 'undefined' when id not found */
  getHeroNo404<Data>(id: number): Observable<Hero> {
    const url = `${this.heroesUrl}/?id=${id}`;
    return this.http.get<Hero[]>(url)
      .pipe(
        map(heroes => heroes[0]), //returns a {0|1} element array
        tap(h => {
          const outcome = h ? `Fetched` : `Did not find`;
          this.log(`${outcome} hero id=${id}`);
        }),
        catchError(this.handleError<Hero>(`getHero id=${id}`))
      );
  }

  /** GET hero by id. Will 404 if id not found */
  getHero(id: number): Observable<Hero> {
    const url = `${this.heroesUrl}/${id}`;
    return this.http.get<Hero>(url).pipe(
      tap(_ => this.log(`Fetched hero id=${id}`)),
      catchError(this.handleError<Hero>(`getHero id=${id}`))
    );
  }

  /* GET heroes whose name contains search term */
  searchHeroes(term: string): Observable<Hero[]> {
    if (!term.trim()) {
      // if not search term, return empty hero array
      return of([]);
    }
    return this.http.get<Hero[]>(`${this.heroesUrl}/?name=${term}`).pipe(
      tap(_ => this.log(`Found heroes matching "${term}"`)),
      catchError(this.handleError<Hero[]>('searchHeroes', []))
    );
  }

  /////////// SAVE METHODS ///////////

  /** POST: add a new hero to the server */
  addHero(hero: Hero): Observable<Hero> {
    return this.http.post<Hero>(this.heroesUrl, hero, httpOptions).pipe(
      tap((hero: Hero) => this.log(`Added hero with id=${hero.id}`)),
      catchError(this.handleError<Hero>('addHero'))
    );
  }

  /** PUT: update the gero on the server */
  updateHero (hero: Hero): Observable<any> {
    return this.http.put(this.heroesUrl, hero, httpOptions).pipe(
      tap(_ => this.log(`Updated hero id=${hero.id}`)),
      catchError(this.handleError<any>('updateHero'))
    );
  }

  /** DELETE: delete the hero from the server */
  deleteHero(hero: Hero | number): Observable<Hero> {
    const id = typeof hero === 'number' ? hero : hero.id;
    const url = `${this.heroesUrl}/${id}`;

    return this.http.delete<Hero>(url, httpOptions).pipe(
      tap(_ => this.log(`Deleted Hero id=${id}`)),
      catchError(this.handleError<Hero>('deleteHero'))
    );
  }

  /**
   * Handle Http operation that failed
   * Let the app continue
   * at_param operation - name of the operation that failed
   * at_param result - optional value to return as the observable result
   */
  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      //TO DO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      //TO DO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);

      //Let the app keep running by returning an empty result
      return of(result as T)
    }
  }

  /** Log a HeroService message with the MessageService */
  private log(message: string) {
    this.messageService.add(`HeroService: ${message}`)
  }

  // getHeroes(): Hero[] {
  //   return HEROES;
  // }

  // getHeroes(): Observable<Hero[]> {
  //   To Do: Send the message AFTER fetching the heroes
  //   this.messageService.add('HeroService: fetched heroes');
  //   return of(HEROES);
  // }

  // getHero(id: number ): Observable<Hero> {
  //   To Do: Send the message AFTER fetching the hero
  //   this.messageService.add(`HeroService: fetched hero id=${id}`);
  //   return of(HEROES.find(hero => hero.id === id ));
  // }
}
