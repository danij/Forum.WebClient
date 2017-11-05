import {UserRepository} from "../services/userRepository";

export module UsersView {

    function getUserLogoColor(id: string): string {

        let r = 283, g = 347, b = 409;
        const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67];

        for (let i = 0; i < id.length; ++i) {

            const char = id.charCodeAt(i);
            const ri = primes.length - (i % primes.length);
            const gi = i;
            const bi = i;

            r += (char * ri) % primes[ri % primes.length];
            g += (char * char * gi) % primes[gi % primes.length];
            b += (char * bi) % primes[bi % primes.length];
        }

        return `rgb(${r % 255}, ${g % 255}, ${b % 255})`;
    }

    export function createUserLogoSmall(user: UserRepository.User): HTMLElement {

        let element = $('<div class="author-logo"></div>');
        element.text(user.name[0]);
        element.css('color', getUserLogoColor(user.id));

        return element[0];
    }

    export function createAuthorSmall(user: UserRepository.User): HTMLElement {

        let element = $('<span class="author"></span>');

        let link = $('<a href="user"></a>');
        element.append(link);
        link.text(user.name);
        element.append(':&nbsp;');

        return element[0];
    }
}