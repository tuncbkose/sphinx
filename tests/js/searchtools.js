describe('Basic html theme search', function() {

  function loadFixture(name) {
      req = new XMLHttpRequest();
      req.open("GET", `base/tests/js/fixtures/${name}`, false);
      req.send(null);
      return req.responseText;
  }

  describe('terms search', function() {

    it('should find "C++" when in index', function() {
      eval(loadFixture("cpp/searchindex.js"));

      [_searchQuery, searchterms, excluded, ..._remainingItems] = Search._parseQuery('C++');
      terms = Search._index.terms;
      titleterms = Search._index.titleterms;

      hits = [[
        "index",
        "&lt;no title&gt;",
        "",
        null,
        5,
        "index.rst"
      ]];
      expect(Search.performTermsSearch(searchterms, excluded, terms, titleterms)).toEqual(hits);
    });

    it('should be able to search for multiple terms', function() {
      eval(loadFixture("multiterm/searchindex.js"));

      [_searchQuery, searchterms, excluded, ..._remainingItems] = Search._parseQuery('main page');
      terms = Search._index.terms;
      titleterms = Search._index.titleterms;
      hits = [[
        'index',
        'Main Page',
        '',
        null,
        15,
        'index.rst']];
      expect(Search.performTermsSearch(searchterms, excluded, terms, titleterms)).toEqual(hits);
    });

    it('should partially-match "sphinx" when in title index', function() {
      eval(loadFixture("partial/searchindex.js"));

      [_searchQuery, searchterms, excluded, ..._remainingItems] = Search._parseQuery('sphinx');
      terms = Search._index.terms;
      titleterms = Search._index.titleterms;

      hits = [[
        "index",
        "sphinx_utils module",
        "",
        null,
        7,
        "index.rst"
      ]];
      expect(Search.performTermsSearch(searchterms, excluded, terms, titleterms)).toEqual(hits);
    });

  });

  describe('aggregation of search results', function() {

    it('should combine document title and document term matches', function() {
      eval(loadFixture("multiterm/searchindex.js"));

      searchParameters = Search._parseQuery('main page');

      hits = [
        [
          'index',
          'Main Page',
          '',
          null,
          100,
          'index.rst'
        ]
      ];
      expect(Search._performSearch(...searchParameters)).toEqual(hits);
    });

  });

});

describe("htmlToText", function() {

  const testHTML = `<html>
  <body>
    <script src="directory/filename.js"></script>
    <div class="body" role="main">
      <script>
        console.log('dynamic');
      </script>
      <style>
        div.body p.centered {
          text-align: center;
          margin-top: 25px;
        }
      </style>
      <!-- main content -->
      <section id="getting-started">
        <h1>Getting Started <a class="headerlink" href="#getting-started" title="Link to this heading">¶</a></h1>
        <p>Some text</p>
      </section>
      <section id="other-section">
        <h1>Other Section <a class="headerlink" href="#other-section" title="Link to this heading">¶</a></h1>
        <p>Other text</p>
      </section>
      <section id="yet-another-section">
        <h1>Yet Another Section <a class="headerlink" href="#yet-another-section" title="Link to this heading">¶</a></h1>
        <p>More text</p>
      </section>
    </div>
  </body>
  </html>`;

  it("basic case", () => {
    expect(Search.htmlToText(testHTML).trim().split(/\s+/)).toEqual([
      'Getting', 'Started', 'Some', 'text', 
      'Other', 'Section', 'Other', 'text', 
      'Yet', 'Another', 'Section', 'More', 'text'
    ]);
  });

  it("will start reading from the anchor", () => {
    expect(Search.htmlToText(testHTML, '#other-section').trim().split(/\s+/)).toEqual(['Other', 'Section', 'Other', 'text']);
  });
});

// This is regression test for https://github.com/sphinx-doc/sphinx/issues/3150
describe('splitQuery regression tests', () => {

  it('can split English words', () => {
    const parts = splitQuery('   Hello    World   ')
    expect(parts).toEqual(['Hello', 'World'])
  })

  it('can split special characters', () => {
    const parts = splitQuery('Pin-Code')
    expect(parts).toEqual(['Pin', 'Code'])
  })

  it('can split Chinese characters', () => {
    const parts = splitQuery('Hello from 中国 上海')
    expect(parts).toEqual(['Hello', 'from', '中国', '上海'])
  })

  it('can split Emoji (surrogate pair) characters. It should keep emojis.', () => {
    const parts = splitQuery('😁😁')
    expect(parts).toEqual(['😁😁'])
  })

  it('can split umlauts. It should keep umlauts.', () => {
    const parts = splitQuery('Löschen Prüfung Abändern ærlig spørsmål')
    expect(parts).toEqual(['Löschen', 'Prüfung', 'Abändern', 'ærlig', 'spørsmål'])
  })

})
